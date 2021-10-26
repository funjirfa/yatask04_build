import { Compiler } from 'webpack';
const { promisify } = require('util');
const { resolve } = require('path');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function getFiles(dir: string) {
    const subdirs = await readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir: string) => {
        const res = resolve(dir, subdir);
        return (await stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a: string, f: string) => a.concat(f), []);
}

class UnusedFiles {
    constructor() {
        // getFiles(resolve(__dirname, '../src')).then((files) => {
        //     console.log(`***\n${files})\n***`);
        // });
    }

    apply(compiler: Compiler) {
        compiler.hooks.done.tap("BundleSizePlugin", stats => {
            console.log(`777 ${ stats.compilation.options.context }`);
        });
    }
}

export default UnusedFiles;