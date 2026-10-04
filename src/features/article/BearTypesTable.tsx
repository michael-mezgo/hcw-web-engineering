import type { JSX } from 'react';

export default function BearTypesTable(): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <td>Bear Type</td>
          <td>Coat</td>
          <td>Adult size</td>
          <td>Habitat</td>
          <td>Lifespan</td>
          <td>Diet</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Wild</td>
          <td>Brown or black</td>
          <td>1.4 to 2.8 meters</td>
          <td>Woods and forests</td>
          <td>25 to 28 years</td>
          <td>Fish, meat, plants</td>
        </tr>
        <tr>
          <td>Urban</td>
          <td>North Face</td>
          <td>18 to 22</td>
          <td>Condos and coffee shops</td>
          <td>20 to 32 years</td>
          <td>Starbucks, sushi</td>
        </tr>
      </tbody>
    </table>
  );
}
