import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { NeonApp } from '@neon-js/core';
import { mockModule, mockCommand } from '@neon-js/core/test-utils';

import { AppProvider } from './app';
import { useCommand, CommandExecutor } from './command';

describe('Command', () => {
  describe('useCommand', () => {
    it('can execute the command', () => {
      const app = new NeonApp('test');
      const command1 = mockCommand('command1');
      const command2 = mockCommand('command2');
      const module1 = mockModule('module1', [command1]);
      const module2 = mockModule('module2', [command2]);
      app.attachModule(module1);
      app.attachModule(module2);

      const wrapper: React.FC = ({ children }) => <AppProvider app={app}>{children}</AppProvider>;
      const hook1 = renderHook(() => useCommand(command1), { wrapper });
      const hook2 = renderHook(() => useCommand(command2), { wrapper });

      const args1 = { arg: 1 };
      hook1.result.current.execute(args1);
      expect(module1.executeCommand).toHaveBeenCalledTimes(1);
      expect(module1.executeCommand).toHaveBeenCalledWith(command1, args1);

      const args2 = { arg: 2 };
      hook2.result.current.execute(args2);
      expect(module2.executeCommand).toHaveBeenCalledTimes(1);
      expect(module2.executeCommand).toHaveBeenCalledWith(command2, args2);
    });
  });

  describe('CommandExecutor', () => {
    it('can execute the command', () => {
      const app = new NeonApp('test');
      const command1 = mockCommand('command1');
      const command2 = mockCommand('command2');
      const module1 = mockModule('module1', [command1, command2]);
      module1.canExecuteCommand = () => true;
      app.attachModule(module1);

      const args = { foo: 'bar' };

      const component = render(
        <AppProvider app={app}>
          <CommandExecutor command={command1} args={args}>
            {(canExecute, execute) => (
              <input role="button" disabled={!canExecute} onClick={() => execute(args)} />
            )}
          </CommandExecutor>
        </AppProvider>,
      );

      const button = component.getByRole('button');
      expect(button.hasAttribute('disabled')).toBeFalsy();

      fireEvent.click(button);
      expect(module1.executeCommand).toHaveBeenCalledTimes(1);
      expect(module1.executeCommand).toHaveBeenCalledWith(command1, args);
    });
  });
});
