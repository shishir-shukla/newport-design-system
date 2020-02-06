import { resolve } from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import babel from 'rollup-plugin-babel';
import { banner } from './utils';

const modes = [
    {
        mode: 'dev',
        minify: false
    },
    {
        mode: 'prod',
        minify: true
    }
];

function getConfig({ mode, minify }) {
    const plugins = [
        nodeResolve(),
        commonjs(),
        babel({
            babelrc: false,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            ie: '11'
                        }
                    }
                ]
            ],
            plugins: ['@babel/plugin-proposal-object-rest-spread'],
            comments: false
        }),
        minify && terser()
    ];

    const suffix = mode === 'prod' ? '' : `.${mode}`;

    return {
        input: resolve(process.cwd(), 'build/esNext/index.js'),
        output: [
            {
                file: `dist/index${suffix}.js`,
                format: 'esm',
                name: 'index',
                banner
            }
        ],
        plugins,
        external: ['instrumentation/service']
    };
}

export default modes.map(getConfig);
