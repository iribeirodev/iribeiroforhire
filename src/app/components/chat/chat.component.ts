import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ChatService, Message } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private chatService = inject(ChatService);

  // Signals
  messages = signal<Message[]>([]);
  question = signal('');
  loading = signal(false);
  remaining = signal(10);
  isLocked = signal(false);
  suggestions = signal<string[]>([]);

  private chatContainer = viewChild<ElementRef>('chatContainer');

  constructor() {
    effect(() => {
      // auto-scroll sempre que a lista de mensagens muda
      this.messages();
      this.scrollToBottom();
    });
  }

  ngOnInit() {
    this.chatService.getHistory().subscribe({
      next: (data) => {
        const history: Message[] = [];

        if (data.length === 0) {
          history.push({
            type: 'bot',
            text: 'Olá! Sou o assistente virtual do Itamar. Como posso ajudar você a conhecer melhor a trajetória profissional dele hoje?',
          });

          // Define as perguntas sugeridas apenas se não houver histórico
          this.suggestions.set([
            'Quais as principais tecnologias do Itamar?',
            'Fale sobre a experiência dele com .NET.',
            'O Itamar tem experiência com IA Generativa?',
          ]);
        } else {
          data.forEach((item) => {
            history.push({ type: 'user', text: item.questionText });
            history.push({ type: 'bot', text: item.answerText });
          });
          this.suggestions.set([]); // Limpa as sugestões se já houver conversa
        }

        this.messages.set(history);
        this.remaining.set(Math.max(0, 10 - data.length));
        if (this.remaining() <= 0) this.isLocked.set(true);
      },
    });
  }

  // Função para enviar a sugestão ao clicar
  selectSuggestion(text: string) {
    this.question.set(text);
    this.suggestions.set([]); // Esconde as sugestões após o primeiro clique
    this.send();
  }

  send() {
    const text = this.question().trim();
    if (this.isLocked() || !text || this.loading()) return;

    this.messages.update((m) => [...m, { type: 'user', text }]);

    // Limpa o input
    this.question.set('');
    this.loading.set(true);

    this.chatService.ask(text).subscribe({
      next: (res) => {
        this.remaining.set(res.remaining);
        this.messages.update((m) => [...m, { type: 'bot', text: res.answer }]);

        if (this.remaining() <= 0) this.isLocked.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.messages.update((m) => [
          ...m,
          { type: 'bot', text: 'Erro na conexão.' },
        ]);
        this.loading.set(false);
      },
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.chatContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
