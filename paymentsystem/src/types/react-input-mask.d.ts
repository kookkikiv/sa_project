declare module 'react-input-mask' {
  import * as React from 'react';

  interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    mask: string | (string | RegExp)[];
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    // Add any other props you use here
  }

  class InputMask extends React.Component<Props> {}

  export default InputMask;
}
