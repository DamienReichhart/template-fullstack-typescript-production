import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();
process.env['NEXT_PUBLIC_API_URL'] = 'http://api.test';
process.env['NEXT_PUBLIC_SITE_URL'] = 'http://web.test';
