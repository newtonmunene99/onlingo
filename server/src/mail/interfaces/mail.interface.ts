export interface Envelope {
  from: string;
  to: string[];
}

export interface MailResponse {
  accepted: string[];
  rejected: any[];
  envelopeTime: number;
  messageTime: number;
  messageSize: number;
  response: string;
  envelope: Envelope;
  messageId: string;
}
