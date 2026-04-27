import type { ClockConfig } from '../types/clock';
import { DependencyEngine } from './DependencyEngine';

export class ConfigManager {
  private dependencyEngine: DependencyEngine;
  private config: ClockConfig;
  private onChange: (newConfig: ClockConfig) => void;

  constructor(initialConfig: ClockConfig, onChange: (newConfig: ClockConfig) => void) {
    this.config = initialConfig;
    this.onChange = onChange;
    this.dependencyEngine = new DependencyEngine();
  }

  updateConfig(key: string, newValue: unknown): void {
    
    // Create a new config with the updated value
    const updatedConfig = this.setNestedValue(this.config, key, newValue);
    
    // Apply any dependencies
    const finalConfig = this.dependencyEngine.applyDependencies(
      updatedConfig,
      key,
      newValue
    );


    // Update internal state and notify listeners
    this.config = finalConfig;
    this.onChange(finalConfig);
  }

  registerDependency(
    independent: string,
    dependents: string[],
    updateFn: (config: ClockConfig, newValue: unknown, key: string) => Partial<ClockConfig>
  ): void {
    this.dependencyEngine.registerDependency(independent, dependents, updateFn);
  }

  getConfig(): ClockConfig {
    return this.config;
  }

  setConfig(newConfig: ClockConfig): void {
    this.config = newConfig;
  }

  getDependents(key: string): string[] {
    return this.dependencyEngine.getDependents(key);
  }

  hasDependencies(key: string): boolean {
    return this.dependencyEngine.hasDependencies(key);
  }

  private setNestedValue(obj: ClockConfig, path: string, value: unknown): ClockConfig {
    const keys = path.split('.');
    const result = JSON.parse(JSON.stringify(obj)); // Deep copy
    
    let current: Record<string, unknown> = result as Record<string, unknown>;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!key) continue;
      
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }
    
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }
    return result;
  }

}

export const createConfigManager = (
  initialConfig: ClockConfig,
  onChange: (newConfig: ClockConfig) => void
): ConfigManager => {
  return new ConfigManager(initialConfig, onChange);
};