import { ConfigService as ConfigServiceSource } from '@nestjs/config';
import { EnvironmentVariables } from './env.validation';
import { readFileSync } from 'fs';

export class ConfigService extends ConfigServiceSource<EnvironmentVariables> {
  /**
   * List of env variables that should be hidden
   */
  public get secrets(): string[] {
    return [this.get('SENTRY_DSN') ?? '', ...this.get('CL_API_URLS'), ...this.get('PROVIDERS_URLS')]
      .filter((v) => v)
      .map((v) => String(v));
  }

  public get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    const value = super.get(key, { infer: true }) as EnvironmentVariables[T]
    if (value !== undefined) {
      return value;
    }

    const filePath = super.get('DB_PASSWORD_FILE', { infer: true })
    if (!filePath) {
      return value
    }
    return readFileSync(filePath, 'utf-8') as EnvironmentVariables[T];
  }
}
