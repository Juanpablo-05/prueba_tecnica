import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      service: 'prescriptions-api',
      status: 'ok',
      version: '0.1.0',
    };
  }
}
