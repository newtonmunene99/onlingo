import { Component, h } from '@stencil/core';

@Component({
  tag: 'onlingo-student',
  styleUrl: 'onlingo-student.scss',
  shadow: false,
})
export class OnlingoStudent {
  render() {
    return (
      <div>
        <p>Hello OnlingoStudent!</p>
      </div>
    );
  }
}
