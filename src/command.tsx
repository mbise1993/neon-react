import React from 'react';
import { Command, CanExecuteChangedHook, CommandArgsType } from '@neon-js/core';

import { useApp } from './app';

export interface UseCommandResult<TCommand extends Command<any, any>> {
  readonly canExecute: boolean;
  execute(args: CommandArgsType<TCommand>): void;
}

export function useCommand<TState>(command: Command<TState, any>): UseCommandResult<typeof command> {
  const app = useApp();
  const provider = app.getCommandProvider(command.id);

  const [canExecute, setCanExecute] = React.useState(true);

  React.useEffect(() => {
    setCanExecute(provider.canExecuteCommand(command));

    const canExecuteChangedHook = new CanExecuteChangedHook<TState>(changed => {
      if (changed.id === command.id) {
        setCanExecute(provider.canExecuteCommand(command));
      }
    });

    provider.registerHook(canExecuteChangedHook);

    return () => provider.removeHook(canExecuteChangedHook);
  }, [command, provider]);

  return {
    canExecute,
    execute: args => provider.executeCommand(command, args),
  };
}

export interface CommandExecutorProps<TCommand extends Command<any, any>> {
  command: TCommand;
  args: CommandArgsType<TCommand>;
  children: (canExecute: boolean, execute: (args: CommandArgsType<TCommand>) => void) => React.ReactElement;
}

export function CommandExecutor<TCommand extends Command<any, any>>({ command, args, children }: CommandExecutorProps<TCommand>) {
  const { canExecute, execute } = useCommand(command);

  return <>{children(canExecute, () => execute(args))}</>;
};
