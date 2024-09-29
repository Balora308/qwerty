import { Injectable, OnModuleInit } from '@nestjs/common';
import { Update, Message } from 'node-telegram-bot-api';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: any;
  private readonly TOKEN = '7861706169:AAHQVdmh758eHoUBWQ3UN43WeuPZBBKQbsE';
  private readonly GROUP_CHAT_IDS = [
    '-4518783645',
    '-4557521033',
    '-4588495546',
    '-4516175363',
  ];

  onModuleInit() {
    this.bot = new (require('node-telegram-bot-api'))(this.TOKEN, {
      polling: true,
    });

    this.bot.onText(/\/start/, (msg) => this.start(msg));
    this.bot.onText(/\/send (.+)/, (msg, match) =>
      this.sendCustomMessage(msg, match),
    );
    this.bot.on('photo', (msg) => this.handleImage(msg));
  }

  private async start(msg: Message) {
    await this.bot.sendMessage(
      msg.chat.id,
      'Привіт! Я готовий надсилати твої повідомлення.',
    );
  }

  private async sendCustomMessage(msg: Message, match: RegExpMatchArray) {
    const customMessage = match[1];
    if (customMessage) {
      for (const chatId of this.GROUP_CHAT_IDS) {
        await this.bot.sendMessage(chatId, customMessage);
      }
      await this.bot.sendMessage(
        msg.chat.id,
        'Твоє повідомлення надіслано у всі групи.',
      );
    } else {
      await this.bot.sendMessage(
        msg.chat.id,
        'Будь ласка, вкажи повідомлення.',
      );
    }
  }

  private async handleImage(msg: Message) {
    if (msg.photo) {
      const photo = msg.photo[msg.photo.length - 1]; // Получаем последнее изображение
      const fileId = photo.file_id;
      const customMessage = msg.caption || 'Вот изображение!';

      for (const chatId of this.GROUP_CHAT_IDS) {
        await this.bot.sendPhoto(chatId, fileId, { caption: customMessage });
      }
      await this.bot.sendMessage(
        msg.chat.id,
        'Зображення надіслано у всі групи з текстом.',
      );
    } else {
      await this.bot.sendMessage(msg.chat.id, 'Це не зображення.');
    }
  }
}
