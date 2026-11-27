import { renderWord } from '../umath/compare'
import { MathView } from '../components/MathView'

const SECTIONS: { title: string; rows: [string, string?][] }[] = [
  {
    title: 'the basics',
    rows: [
      ['x_i', 'subscript'],
      ['x^2', 'superscript'],
      ['x_i^2', 'both'],
      ['x_(i+1)', 'brackets group the script, and disappear'],
      ['a/b', 'fraction'],
      ['(a+b)/(c-d)', 'brackets around top/bottom disappear too'],
      ['1/n x', 'a space ends the fraction'],
    ],
  },
  {
    title: 'greek & symbols',
    rows: [
      ['\\alpha \\beta \\sigma \\mu \\lambda', 'any greek letter by name'],
      ['\\Delta \\Sigma', 'capital = capital first letter'],
      ['\\epsilon \\varepsilon', 'two kinds of epsilon (both accepted)'],
      ['\\partial \\infty', ''],
      ['\\le \\ge \\ne \\approx', 'also <= and >='],
      ['\\pm \\cdot \\times', ''],
      ['\\cup \\cap \\in', ''],
    ],
  },
  {
    title: 'accents – they go after the letter',
    rows: [
      ['x\\bar', 'mean'],
      ['\\beta\\hat', 'estimate'],
      ['\\beta\\hat_1', 'accent, then subscript'],
      ['k\\dot', 'time derivative'],
      ['x^*', 'optimum / steady state'],
      ["f'(x)", 'prime'],
    ],
  },
  {
    title: 'big operators & roots',
    rows: [
      ['\\sum_(i=1)^n x_i', 'sum'],
      ['\\prod_(i=1)^n f(x_i)', 'product'],
      ['\\int_0^1 f(x) dx', 'integral'],
      ['\\sqrt(n)', 'square root'],
      ['(n\\atop k)', 'binomial coefficient'],
    ],
  },
]

export function CheatSheet() {
  return (
    <div className="page">
      <h2>how to type it in word</h2>
      <p>
        In Word, press <kbd>Alt</kbd>+<kbd>=</kbd> to start an equation, type the stuff on the left, and Word builds
        it up when you hit space. That's exactly what you practise here.
      </p>
      <p>
        One gotcha: the space after a control word like <code>\alpha</code> gets eaten when Word converts it. So{' '}
        <code>x^\alpha y</code> puts the y in the exponent – type two spaces: <code>x^\alpha&nbsp;&nbsp;y</code>.
      </p>

      {SECTIONS.map((s) => (
        <table key={s.title} className="cheat">
          <caption>{s.title}</caption>
          <tbody>
            {s.rows.map(([src, note]) => (
              <tr key={src}>
                <td className="mono">{src}</td>
                <td className="res">
                  <MathView mathml={renderWord(src)} />
                </td>
                <td className="hint">{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}
