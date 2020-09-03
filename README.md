# Bem block

## What is it
Helper for BEM blocks, it will be auto creating instances per each block, supports dynamic content (like ajax) thanks to MutationObserver.

## Installation
```
yarn add @lightsource/bem-block
```
OR
```
npm install @lightsource/bem-block
```

## Example of usage

```
import bemBlock from '@lightsource/bem-block';

class Start extends bemBlock.Class {


    //////// constructor


    constructor(element) {

        super(element);

        // TODO add listeners, etc..

    }

}

bemBlock.Register('.start', Start);
```
