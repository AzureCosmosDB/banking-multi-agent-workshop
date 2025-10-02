export class Message {
    id!: string;
    type!: string;
    tenantId!: string;
    userId!: string;
    sessionId!: string;
    timeStamp!: Date;
    prompt!: string;
    promptTokens!: number;
    senderRole!: string;
    completion!: string;
    debugLogId! : string;
    completionTokens!: number;
    debugInfo ! : propertyBag;
    showDebug = false;
    generationTokens!: number;
    cacheHit!: boolean;
    sender!:string;
    elapsedMilliseconds!: number;
    private startTime!: number;
}

export class propertyBag{
   key! : string;
   value! : string;
   timestamp! : string;
}