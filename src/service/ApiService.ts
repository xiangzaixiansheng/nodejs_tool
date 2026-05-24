import { logger } from '../util/logger';

export class ApiService {
    /**
     * 测试请求
     */
    public async testRequestV1(): Promise<string> {
        logger.info('Test request executed');
        return 'Test successful';
    }
}
