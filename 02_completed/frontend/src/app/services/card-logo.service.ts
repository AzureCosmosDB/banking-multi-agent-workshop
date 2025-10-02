import { Injectable } from '@angular/core';
import { CardType } from '../models/account';

export interface CardLogo {
  type: CardType;
  name: string;
  logoPath: string;
  altText: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardLogoService {
  private cardLogos: CardLogo[] = [
    {
      type: CardType.Visa,
      name: 'Visa',
      logoPath: 'assets/card-logos/visa.svg',
      altText: 'Visa Card'
    },
    {
      type: CardType.MasterCard,
      name: 'MasterCard',
      logoPath: 'assets/card-logos/mastercard.svg',
      altText: 'MasterCard'
    },
    {
      type: CardType.AmericanExpress,
      name: 'American Express',
      logoPath: 'assets/card-logos/amex.svg',
      altText: 'American Express Card'
    },
    {
      type: CardType.Discover,
      name: 'Discover',
      logoPath: 'assets/card-logos/discover.svg',
      altText: 'Discover Card'
    },
    {
      type: CardType.UnionPay,
      name: 'UnionPay',
      logoPath: 'assets/card-logos/unionpay.svg',
      altText: 'UnionPay Card'
    },
    {
      type: CardType.JCB,
      name: 'JCB',
      logoPath: 'assets/card-logos/jcb.svg',
      altText: 'JCB Card'
    },
    {
      type: CardType.Maestro,
      name: 'Maestro',
      logoPath: 'assets/card-logos/maestro.svg',
      altText: 'Maestro Card'
    },
    {
      type: CardType.Cirrus,
      name: 'Cirrus',
      logoPath: 'assets/card-logos/cirrus.svg',
      altText: 'Cirrus Card'
    }
  ];

  constructor() { }

  /**
   * Get card logo information by card type
   */
  getCardLogo(cardType: CardType): CardLogo | null {
    if (cardType === CardType.None || cardType === undefined || cardType === null) {
      return null;
    }
    return this.cardLogos.find(logo => logo.type === cardType) || null;
  }

  /**
   * Get card type name by enum value
   */
  getCardTypeName(cardType: CardType): string {
    const cardLogo = this.getCardLogo(cardType);
    return cardLogo ? cardLogo.name : 'Unknown';
  }

  /**
   * Detect card type from card number using industry standards
   */
  detectCardTypeFromNumber(cardNumber: string): CardType {
    if (!cardNumber) {
      return CardType.None;
    }

    // Remove spaces and non-numeric characters
    const cleanCardNumber = cardNumber.replace(/\D/g, '');

    if (cleanCardNumber.length < 4) {
      return CardType.None;
    }

    // Visa: starts with 4
    if (cleanCardNumber.startsWith('4')) {
      return CardType.Visa;
    }

    // MasterCard: starts with 5 or 2 (new range 2221-2720)
    if (cleanCardNumber.startsWith('5') || 
        (cleanCardNumber.startsWith('2') && parseInt(cleanCardNumber.substr(0, 4)) >= 2221 && parseInt(cleanCardNumber.substr(0, 4)) <= 2720)) {
      return CardType.MasterCard;
    }

    // American Express: starts with 34 or 37
    if (cleanCardNumber.startsWith('34') || cleanCardNumber.startsWith('37')) {
      return CardType.AmericanExpress;
    }

    // Discover: starts with 6
    if (cleanCardNumber.startsWith('6')) {
      return CardType.Discover;
    }

    // UnionPay: starts with 62
    if (cleanCardNumber.startsWith('62')) {
      return CardType.UnionPay;
    }

    // JCB: starts with 35
    if (cleanCardNumber.startsWith('35')) {
      return CardType.JCB;
    }

    // Maestro: starts with 50, 56-58, 6
    if (cleanCardNumber.startsWith('50') || 
        cleanCardNumber.startsWith('56') || 
        cleanCardNumber.startsWith('57') || 
        cleanCardNumber.startsWith('58')) {
      return CardType.Maestro;
    }

    // Default to None if no match
    return CardType.None;
  }

  /**
   * Get all available card types with their logos
   */
  getAllCardLogos(): CardLogo[] {
    return [...this.cardLogos];
  }

  /**
   * Check if card type has a logo available
   */
  hasLogo(cardType: CardType): boolean {
    return this.getCardLogo(cardType) !== null;
  }
}