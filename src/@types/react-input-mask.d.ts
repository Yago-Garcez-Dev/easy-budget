// react-input-mask.d.ts
declare module 'react-input-mask' {
    import * as React from 'react';

    interface Props {
        mask: string;
        value?: string;
        onChange?: React.ChangeEventHandler<HTMLInputElement>;
        maskChar?: string | null;
        alwaysShowMask?: boolean;
        beforeMaskedValueChange?: (newState: { value: string, selection: { start: number, end: number } }, oldState: { value: string, selection: { start: number, end: number } }) => { value: string, selection: { start: number, end: number } };
    }

    export default class InputMask extends React.Component<Props> { }
}
