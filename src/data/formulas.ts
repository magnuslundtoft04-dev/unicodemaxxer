// The formula bank. `src` is exactly what you'd type into a Word equation.
// Level 1 = first weeks of the course, 2 = mid-semester, 3 = exam-hard.
//
// Rules for adding formulas:
//  - only stuff that is actually on a stats / micro / macro syllabus
//  - write `src` the Word way: x\bar not \bar x, (a+b)/c, \sqrt(n), \sum_(i=1)^n
//  - after a control word Word eats ONE space, so use two spaces when you
//    need a real separator: x^\alpha  y^\beta
//  - run `npm test` – it checks every formula parses cleanly

export type Subject = 'stats' | 'micro' | 'macro'
export type Level = 1 | 2 | 3

export interface Formula {
  src: string
  name: string
  subject: Subject
  level: Level
}

type Row = [src: string, name: string]

const bank: Record<Subject, Record<Level, Row[]>> = {
  stats: {
    1: [
      ['P(A\\bar)=1-P(A)', 'complement rule'],
      ['E(X)=\\mu', 'expected value'],
      ['\\sigma=\\sqrt(\\sigma^2)', 'standard deviation'],
      ['P(A\\cup B)=P(A)+P(B)-P(A\\cap B)', 'addition rule'],
      ['P(A|B)=P(A\\cap B)/P(B)', 'conditional probability'],
      ['x\\bar=1/n \\sum_(i=1)^n x_i', 'sample mean'],
      ['z=(x-\\mu)/\\sigma', 'z-score'],
      ['SE=\\sigma/\\sqrt(n)', 'standard error'],
      ['H_0: \\mu=\\mu_0', 'null hypothesis'],
      ['E(aX+b)=aE(X)+b', 'linearity of expectation'],
      ['Var(aX+b)=a^2 Var(X)', 'variance of a linear transformation'],
      ['Var(X)=E(X^2)-E(X)^2', 'variance shortcut'],
      ['P(A\\cap B)=P(A)P(B)', 'independence'],
    ],
    2: [
      ['s^2=1/(n-1) \\sum_(i=1)^n (x_i-x\\bar)^2', 'sample variance'],
      ['x\\bar\\pm z_(\\alpha/2) \\sigma/\\sqrt(n)', 'confidence interval, σ known'],
      ['t=(x\\bar-\\mu_0)/(s/\\sqrt(n))', 't-statistic'],
      ['P(X=k)=(n\\atop k) p^k (1-p)^(n-k)', 'binomial distribution'],
      ['P(X=k)=(\\lambda^k e^(-\\lambda))/k!', 'poisson distribution'],
      ['Cov(X,Y)=E(XY)-E(X)E(Y)', 'covariance'],
      ['\\rho=Cov(X,Y)/(\\sigma_X \\sigma_Y)', 'correlation'],
      ['Y_i=\\beta_0+\\beta_1 X_i+\\epsilon_i', 'simple linear regression'],
      ['f(x)=\\lambda e^(-\\lambda x)', 'exponential density'],
      ['R^2=1-SSE/SST', 'coefficient of determination'],
      ['\\chi^2=\\sum (O_i-E_i)^2/E_i', 'chi-square statistic'],
      ['Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)', 'variance of a sum'],
      ['p\\hat\\pm z_(\\alpha/2) \\sqrt(p\\hat(1-p\\hat)/n)', 'confidence interval for a proportion'],
    ],
    3: [
      ['f(x)=1/(\\sigma\\sqrt(2\\pi)) e^(-(x-\\mu)^2/(2\\sigma^2))', 'normal density'],
      ['t=(x\\bar_1-x\\bar_2)/\\sqrt(s_1^2/n_1+s_2^2/n_2)', 'two-sample t-test'],
      ['F=(SSR/k)/(SSE/(n-k-1))', 'F-test in regression'],
      ['\\beta\\hat=(X^T X)^(-1) X^T y', 'OLS in matrix form'],
      ['\\beta\\hat_1=(\\sum_(i=1)^n (x_i-x\\bar)(y_i-y\\bar))/(\\sum_(i=1)^n (x_i-x\\bar)^2)', 'OLS slope'],
      ['L(\\theta)=\\prod_(i=1)^n f(x_i|\\theta)', 'likelihood function'],
      ['ln L(\\theta)=\\sum_(i=1)^n ln f(x_i|\\theta)', 'log-likelihood'],
      ['x\\bar\\pm t_(\\alpha/2,n-1) s/\\sqrt(n)', 'confidence interval, σ unknown'],
      ['Var(\\beta\\hat_1)=\\sigma^2/(\\sum_(i=1)^n (x_i-x\\bar)^2)', 'variance of the OLS slope'],
      ['\\chi^2=\\sum_(i=1)^r \\sum_(j=1)^c (O_ij-E_ij)^2/E_ij', 'test of independence'],
      ['P(A|B)=(P(B|A)P(A))/P(B)', "bayes' theorem"],
      ['z=(p\\hat_1-p\\hat_2)/\\sqrt(p\\hat(1-p\\hat)(1/n_1+1/n_2))', 'two-proportion z-test'],
      ['R\\bar^2=1-(1-R^2) (n-1)/(n-k-1)', 'adjusted R²'],
    ],
  },

  micro: {
    1: [
      ['\\pi=TR-TC', 'profit'],
      ['TR=p\\cdot q', 'total revenue'],
      ['MR=MC', 'profit maximisation'],
      ['AC=TC/q', 'average cost'],
      ['MC=\\Delta TC/\\Delta q', 'marginal cost'],
      ['p_x x+p_y y=I', 'budget constraint'],
      ['MRS=MU_x/MU_y', 'marginal rate of substitution'],
      ['MRS=p_x/p_y', 'consumer optimum'],
      ['U(x,y)=xy', 'utility function'],
      ['Q_d=a-bP', 'linear demand'],
      ['CS=1/2 (a-p)q', 'consumer surplus'],
      ['\\epsilon=(\\Delta Q/Q)/(\\Delta P/P)', 'price elasticity'],
      ['TC=FC+VC', 'total cost'],
    ],
    2: [
      ['U(x,y)=x^\\alpha  y^(1-\\alpha)', 'cobb-douglas utility'],
      ['MU_x=\\partial U/\\partial x', 'marginal utility'],
      ['MU_x/p_x=MU_y/p_y', 'equal marginal principle'],
      ['Q=AL^\\alpha  K^\\beta', 'cobb-douglas production'],
      ['MP_L=\\partial Q/\\partial L', 'marginal product of labour'],
      ['MRTS=MP_L/MP_K=w/r', 'cost minimisation'],
      ['Q=min(aL,bK)', 'leontief production'],
      ['U(x,y)=ln x+ln y', 'log utility'],
      ['\\pi=p\\cdot q-c(q)', 'firm profit'],
      ['p_m=(a+c)/2', 'monopoly price, linear demand'],
      ['HHI=\\sum_(i=1)^n s_i^2', 'herfindahl index'],
      ['\\epsilon_(x,p)=(\\Delta x/x)/(\\Delta p/p)', 'own-price elasticity'],
      ['AVC=VC/q', 'average variable cost'],
    ],
    3: [
      ['L=x^\\alpha  y^(1-\\alpha)+\\lambda(I-p_x x-p_y y)', 'lagrangian'],
      ['\\partial L/\\partial x=\\alpha x^(\\alpha-1) y^(1-\\alpha)-\\lambda p_x=0', 'first-order condition'],
      ['x^*=\\alpha I/p_x', 'cobb-douglas demand'],
      ['\\epsilon=\\partial Q/\\partial P\\cdot P/Q', 'point elasticity'],
      ['\\eta=\\partial x/\\partial I\\cdot I/x', 'income elasticity'],
      ['MRS=(\\partial U/\\partial x)/(\\partial U/\\partial y)', 'MRS from utility'],
      ['\\pi_1=(a-b(q_1+q_2))q_1-cq_1', 'cournot profit'],
      ['q_1^*=(a-c)/(3b)', 'cournot equilibrium'],
      ['CS=\\int_0^(q^*) (P(q)-p^*) dq', 'consumer surplus, integral'],
      ['(p-MC)/p=-1/\\epsilon', 'lerner index'],
      ['E(U)=pU(w_1)+(1-p)U(w_2)', 'expected utility'],
      ['DWL=1/2 (p_m-p_c)(q_c-q_m)', 'deadweight loss'],
      ['TC(q)=wL^*(q)+rK^*(q)', 'cost function'],
    ],
  },

  macro: {
    1: [
      ['Y=C+I+G+NX', 'GDP, expenditure approach'],
      ['NX=X-M', 'net exports'],
      ['S=Y-T-C', 'national saving'],
      ['Y_d=Y-T', 'disposable income'],
      ['C=C_0+cY_d', 'consumption function'],
      ['r=i-\\pi', 'fisher equation'],
      ['MV=PY', 'quantity theory of money'],
      ['u=U/L', 'unemployment rate'],
      ['g_Y=\\Delta Y/Y', 'growth rate'],
      ['\\pi=(P_t-P_(t-1))/P_(t-1)', 'inflation'],
      ['S=I', 'goods market equilibrium'],
      ['i\\approx r+\\pi^e', 'fisher, expected inflation'],
      ['Y=AF(K,L)', 'production function'],
    ],
    2: [
      ['m=1/(1-c)', 'keynesian multiplier'],
      ['Y=C_0+c(Y-T)+I+G', 'IS curve'],
      ['M/P=L(i,Y)', 'LM curve'],
      ['\\pi_t=\\pi_t^e-\\alpha(u_t-u_n)', 'phillips curve'],
      ['Y=AK^\\alpha  L^(1-\\alpha)', 'cobb-douglas production'],
      ['\\Delta k=sf(k)-(n+\\delta)k', 'solow capital accumulation'],
      ['mm=(1+cr)/(cr+rr)', 'money multiplier'],
      ['\\epsilon=eP^*/P', 'real exchange rate'],
      ['NX=NX(\\epsilon,Y,Y^*)', 'net exports function'],
      ['Y=1/(1-c) (C_0+I+G-cT)', 'equilibrium output'],
      ['y=Y/L=Ak^\\alpha', 'output per worker'],
      ['Y=Y_n+\\alpha(P-P^e)', 'short-run aggregate supply'],
      ['u_n=s/(s+f)', 'natural rate of unemployment'],
    ],
    3: [
      ['k^*=(s/(n+\\delta))^(1/(1-\\alpha))', 'solow steady state'],
      ['g_Y=g_A+\\alpha g_K+(1-\\alpha) g_L', 'growth accounting'],
      ['PV=\\sum_(t=0)^\\infty  Y_t/(1+r)^t', 'present value'],
      ['i_t=r^*+\\pi_t+0.5(\\pi_t-\\pi^*)+0.5(y_t-y\\bar)', 'taylor rule'],
      ['i=i^*+(E^e-E)/E', 'uncovered interest parity'],
      ['\\partial Y/\\partial G=1/(1-c(1-t)+m)', 'open-economy multiplier'],
      ['c^*=f(k^*)-(n+g+\\delta)k^*', 'golden rule consumption'],
      ['y\\dot/y=\\alpha k\\dot/k+(1-\\alpha) n', 'growth in output per worker'],
      ['\\pi_t=\\beta E_t \\pi_(t+1)+\\kappa(y_t-y\\bar_t)', 'new keynesian phillips curve'],
      ['U=\\sum_(t=0)^\\infty  \\beta^t u(c_t)', 'lifetime utility'],
      ['u\'(c_t)=\\beta(1+r)u\'(c_(t+1))', 'euler equation'],
      ['M_s/P=L(r+\\pi^e,Y)', 'money market equilibrium'],
      ['\\Delta B=G-T+rB', 'government budget constraint'],
    ],
  },
}

export const FORMULAS: Formula[] = (Object.keys(bank) as Subject[]).flatMap((subject) =>
  ([1, 2, 3] as Level[]).flatMap((level) =>
    bank[subject][level].map(([src, name]) => ({ src, name, subject, level })),
  ),
)

export const SUBJECT_LABEL: Record<Subject, string> = {
  stats: 'statistics',
  micro: 'microeconomics',
  macro: 'macroeconomics',
}

export const LEVEL_LABEL: Record<Level, string> = {
  1: 'basic',
  2: 'mid',
  3: 'exam',
}
