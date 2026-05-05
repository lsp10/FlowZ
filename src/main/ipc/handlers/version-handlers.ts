/**
 * 版本信息 IPC 处理器
 */

import { IpcMainInvokeEvent, app, shell } from 'electron';
import { IPC_CHANNELS } from '../../../shared/ipc-channels';
import { registerIpcHandler } from '../ipc-handler';

interface VersionInfo {
  appVersion: string;
  appName: string;
  buildDate: string;
  singBoxVersion: string;
  copyright: string;
  repositoryUrl: string;
}

let proxyManagerRef: { getCoreVersion(): Promise<string> } | null = null;

export function registerVersionHandlers(proxyManager?: {
  getCoreVersion(): Promise<string>;
}): void {
  if (proxyManager) {
    proxyManagerRef = proxyManager;
  }

  registerIpcHandler<void, VersionInfo>(
    IPC_CHANNELS.VERSION_GET_INFO,
    async (_event: IpcMainInvokeEvent) => {
      let singBoxVersion = 'Unknown';
      if (proxyManagerRef) {
        try {
          const version = await proxyManagerRef.getCoreVersion();
          if (version && version !== '未知') {
            singBoxVersion = version;
          }
        } catch {
          // ignore
        }
      }

      return {
        appVersion: app.getVersion(),
        appName: 'FlowZ',
        buildDate: new Date().toISOString().split('T')[0],
        singBoxVersion,
        copyright: `© ${new Date().getFullYear()} FlowZ. All rights reserved.`,
        repositoryUrl: 'https://github.com/dododook/FlowZ',
      };
    }
  );

  registerIpcHandler<string, boolean>(
    IPC_CHANNELS.SHELL_OPEN_EXTERNAL,
    async (_event: IpcMainInvokeEvent, url: string) => {
      await shell.openExternal(url);
      return true;
    }
  );
}
