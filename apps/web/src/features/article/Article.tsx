import type { JSX } from 'react';
import CommentSection from '../comments/CommentSection';
import MoreBears from '../bears/MoreBears';
import Highlight from '../search/Highlight';
import BearTypesTable from './BearTypesTable';

export default function Article(): JSX.Element {
  return (
    <article>
      <h2>
        <Highlight text="The trouble with Bears" />
      </h2>
      <Highlight text="By Evan Wild" />
      <br />
      <br />
      <Highlight text="Tall, lumbering, angry, dangerous. The real live bears of this world are proud, independent creatures, self-serving and always on the hunt for food." />
      <br />
      <br />
      <h3>
        <Highlight text="Types of bear" />
      </h3>
      <BearTypesTable />
      <h3>
        <Highlight text="Habitats and Eating habits" />
      </h3>
      <Highlight text="Wild bears eat a variety of meat, fish, fruit, nuts, and other natually growing ingredients..." />
      <br />
      <br />
      <img src="/wild-bear.jpg" alt="Wild bear in forest" />
      <br />
      <br />
      <Highlight text="Urban (gentrified) bears on the other hand have largely abandoned the old ways..." />
      <br />
      <br />
      <img src="/urban-bear.jpg" alt="Urban bear near buildings" />
      <br />
      <br />
      <h3>
        <Highlight text="Mating rituals" />
      </h3>
      <Highlight text="Bears are romantic creatures by nature..." />
      <br />
      <br />
      <audio controls>
        <source src="/bear.mp3" type="audio/mp3" />
        <source src="/bear.ogg" type="audio/ogg" />
        <p>
          It looks like your browser doesn&apos;t support HTML5 audio players.
        </p>
      </audio>
      <aside>
        <h3>
          <Highlight text="About the author" />
        </h3>
        <Highlight text="Evan Wild is an unemployed plumber from Doncaster..." />
      </aside>
      <CommentSection />
      <MoreBears />
    </article>
  );
}
