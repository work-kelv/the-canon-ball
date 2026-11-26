import { Fragment } from 'react';
import { Term } from '../Term';

/** A line of a creed, with the 1662 spelling “Catholick” explained on tap. */
export function CreedText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(Catholick)/).map((part, i) =>
        part === 'Catholick' ? (
          <Term key={i} t="catholic">
            Catholick
          </Term>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
