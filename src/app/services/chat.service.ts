import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Message {
  type: 'user' | 'bot';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);

  private apiURL = `${environment.apiUrl}/question`;

  // Atenção aqui:
  private readonly options = { withCredentials: true };

  getHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/history`, this.options);
  }

  ask(question: string): Observable<any> {
    // Note que o corpo do POST deve bater com o QuestionRequest do seu C# (Propriedade "Question")
    return this.http.post<any>(
      `${this.apiURL}/ask`,
      { question },
      this.options
    );
  }
}
