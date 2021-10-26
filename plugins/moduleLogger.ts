import { Compiler } from 'webpack';

const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// async function getFiles(dir: string): Promise<string[]> {
//     const subdirs = await readdir(dir);
//     const files: Promise<Array<string> | string> =  Promise.all(subdirs.map(async (subdir: string) => {
//         const res = resolve(dir, subdir);
//         return (await stat(res)).isDirectory() ? getFiles(res) : res;
//     }));
//     return files.reduce((a: string[] | string, f: string[] | string) => a.concat(f), []);
// }

function getFilesSync(dir: string, result: string[] = []): string[] {
    const subDirs = fs.readdirSync(dir);
    subDirs.forEach((subDir: string) => {
        const source = resolve(dir, subDir);
        if (fs.statSync(source).isDirectory()) {
            getFilesSync(source, result);
        } else {
            result.push(source);
        }
    });

    return result;
}

interface ReadonlyStringArray {
    readonly [index: string]: number;
}

class ModuleLogger {
    private readonly files: string[];
    private usedFiles: ReadonlyStringArray = {};

    constructor() {
        this.files = getFilesSync(resolve(__dirname, '../src'));
    }
    apply(compiler: Compiler) {
        compiler.hooks.normalModuleFactory.tap(
            'ModuleLogger',
            (normalModuleFactory) => {
                normalModuleFactory.hooks.module.tap('ModuleLogger', (_module, _createData, resolveData) => {
                    // @ts-ignore
                    // console.log(`+++ ${ _createData.resource }`);
                    //
                    // console.log(`--- ${ resolveData.context }`);

                    this.usedFiles[_createData.resource] = 1;

                    return _module;
                });
            }
        );

        compiler.hooks.done.tap("BundleSizePlugin", stats => {
            fs.writeFileSync(resolve(__dirname, '../unused'), JSON.stringify(this.files.filter(file => !this.usedFiles[file]), null, 2));
        });
    }
}

export default ModuleLogger;