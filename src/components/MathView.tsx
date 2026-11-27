// MathML comes from our own renderer (escaped), so innerHTML is safe here.
export function MathView({ mathml }: { mathml: string }) {
  return <span className="math" dangerouslySetInnerHTML={{ __html: mathml }} />
}
