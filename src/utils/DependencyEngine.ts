import type { ClockConfig } from '../types/clock';

export type DependencyUpdateFn<T = unknown> = (
  config: ClockConfig,
  newValue: T,
  key: string
) => Partial<ClockConfig>;

export interface DependencyRule {
  independent: string;
  dependents: string[];
  updateFn: DependencyUpdateFn;
}

export class DependencyEngine {
  private rules: Map<string, DependencyRule[]> = new Map();

  registerDependency(
    independent: string,
    dependents: string[],
    updateFn: DependencyUpdateFn
  ): void {
    if (!this.rules.has(independent)) {
      this.rules.set(independent, []);
    }
    
    this.rules.get(independent)!.push({
      independent,
      dependents,
      updateFn,
    });
  }

  applyDependencies(
    config: ClockConfig,
    key: string,
    newValue: unknown
  ): ClockConfig {
    const rules = this.rules.get(key);
    if (!rules) {
      return config;
    }

    let updatedConfig = { ...config };
    
    for (const rule of rules) {
      const updates = rule.updateFn(updatedConfig, newValue, key);
      updatedConfig = { ...updatedConfig, ...updates };
    }

    return updatedConfig;
  }

  getDependents(key: string): string[] {
    const rules = this.rules.get(key);
    if (!rules) {
      return [];
    }

    return rules.flatMap(rule => rule.dependents);
  }

  hasDependencies(key: string): boolean {
    return this.rules.has(key);
  }

  clearDependencies(key?: string): void {
    if (key) {
      this.rules.delete(key);
    } else {
      this.rules.clear();
    }
  }
}

export const createDependencyEngine = (): DependencyEngine => {
  return new DependencyEngine();
};