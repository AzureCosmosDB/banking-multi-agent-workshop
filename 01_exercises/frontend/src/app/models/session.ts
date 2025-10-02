export class Session {
    id: string;
    type: string;
    tenantId: string;
    userId: string;
    sessionId: string;
    tokens: number | null;
    name: string;
    private messages: Message[];

    constructor(tenantId: string, userId: string, name: string, sessionId?: string) {
        this.id = this.generateUUID();
        this.type = "Session";
        this.sessionId = sessionId ?? this.generateUUID();
        this.userId = userId;
        this.tenantId = tenantId;
        this.tokens = 0;
        this.name = name
        this.messages = [];
    }

    private generateUUID(): string {
        return crypto.randomUUID();
    }

    addMessage(message: Message): void {
        this.messages.push(message);
    }

    updateMessage(message: Message): void {
        const index = this.messages.findIndex(m => m.id === message.id);
        if (index !== -1) {
            this.messages[index] = message;
        }
    }
}

interface Message {
    id: string;
    content: string;
}
