(() => {
  const defaultCoreURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
  const types = {
    LOAD:'LOAD', EXEC:'EXEC', WRITE_FILE:'WRITE_FILE', READ_FILE:'READ_FILE',
    DELETE_FILE:'DELETE_FILE', RENAME:'RENAME', CREATE_DIR:'CREATE_DIR',
    LIST_DIR:'LIST_DIR', DELETE_DIR:'DELETE_DIR', ERROR:'ERROR', DOWNLOAD:'DOWNLOAD',
    PROGRESS:'PROGRESS', LOG:'LOG', MOUNT:'MOUNT', UNMOUNT:'UNMOUNT'
  };
  const unknownMessage = new Error('unknown message type');
  const notLoaded = new Error('ffmpeg is not loaded, call `await ffmpeg.load()` first');
  const failedCoreImport = new Error('failed to import ffmpeg-core.js');
  let core = null;

  async function loadCore({ coreURL, wasmURL, workerURL }) {
    let createFFmpegCore;
    const resolvedCoreURL = coreURL || defaultCoreURL;
    try {
      importScripts(resolvedCoreURL);
      createFFmpegCore = self.createFFmpegCore;
    } catch (_) {
      const esmURL = resolvedCoreURL.replace('/umd/', '/esm/');
      createFFmpegCore = (await import(esmURL)).default;
    }
    if (!createFFmpegCore) throw failedCoreImport;
    const resolvedWasmURL = wasmURL || resolvedCoreURL.replace(/\.js$/g, '.wasm');
    const resolvedWorkerURL = workerURL || resolvedCoreURL.replace(/\.js$/g, '.worker.js');
    core = await createFFmpegCore({
      mainScriptUrlOrBlob:`${resolvedCoreURL}#${btoa(JSON.stringify({ wasmURL:resolvedWasmURL, workerURL:resolvedWorkerURL }))}`
    });
    core.setLogger(message => self.postMessage({ type:types.LOG, data:message }));
    core.setProgress(message => self.postMessage({ type:types.PROGRESS, data:message }));
    return true;
  }

  self.onmessage = async ({ data:{ id, type, data } }) => {
    const transferables = [];
    let result;
    try {
      if (type !== types.LOAD && !core) throw notLoaded;
      switch (type) {
        case types.LOAD:
          result = await loadCore(data);
          break;
        case types.EXEC:
          core.setTimeout(data.timeout ?? -1);
          core.exec(...data.args);
          result = core.ret;
          core.reset();
          break;
        case types.WRITE_FILE:
          core.FS.writeFile(data.path, data.data);
          result = true;
          break;
        case types.READ_FILE:
          result = core.FS.readFile(data.path, { encoding:data.encoding });
          break;
        case types.DELETE_FILE:
          core.FS.unlink(data.path);
          result = true;
          break;
        case types.RENAME:
          core.FS.rename(data.oldPath, data.newPath);
          result = true;
          break;
        case types.CREATE_DIR:
          core.FS.mkdir(data.path);
          result = true;
          break;
        case types.LIST_DIR:
          result = core.FS.readdir(data.path).map(name => {
            const stat = core.FS.stat(`${data.path}/${name}`);
            return { name, isDir:core.FS.isDir(stat.mode) };
          });
          break;
        case types.DELETE_DIR:
          core.FS.rmdir(data.path);
          result = true;
          break;
        case types.MOUNT: {
          const filesystem = core.FS.filesystems[data.fsType];
          if (!filesystem) {
            result = false;
            break;
          }
          core.FS.mount(filesystem, data.options, data.mountPoint);
          result = true;
          break;
        }
        case types.UNMOUNT:
          core.FS.unmount(data.mountPoint);
          result = true;
          break;
        default:
          throw unknownMessage;
      }
    } catch (error) {
      self.postMessage({ id, type:types.ERROR, data:String(error) });
      return;
    }
    if (result instanceof Uint8Array) transferables.push(result.buffer);
    self.postMessage({ id, type, data:result }, transferables);
  };
})();
