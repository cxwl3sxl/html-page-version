import typescript from 'rollup-plugin-typescript2'; // 处理typescript
import babel from '@rollup/plugin-babel';
import dts from "rollup-plugin-dts";

/**
 * 
 */
export default [
    {
        input: './src/index.ts',
        plugins: [
            typescript(), // typescript 转义
            babel({
                babelrc: false,
                presets: [['@babel/preset-env', { modules: false, loose: true }]],
                plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
                exclude: 'node_modules/**',
            })
        ],
        output: [
            { file: 'dist/html-page-version.cjs.js', format: 'cjs' },
            { file: 'dist/html-page-version.esm.js', format: 'esm' },
            { file: 'dist/html-page-version.iife.js', name: "nativeAppLib", format: 'iife' },
            { file: 'dist/html-page-version.umd.js', name: "nativeAppLib", format: 'umd' }
        ]
    },
    {
        input: 'src/index.ts',
        plugins: [dts()],
        output: [
            { file: 'dist/index.d.ts', format: 'es' }
        ]
    }
];