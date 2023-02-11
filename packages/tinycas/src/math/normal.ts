/* 
Les formes normales servent à déterminer si deux expressions sont équivalentes.
Les formes normales sont vues comme des fractions rationnelles.
Le numérateur et le dénominateur doivent être développées et réduits. Les fractions et racines doivent être simplifiées.
Les fonctions numériques doivent être évaluées à une forme exacte.
Les unités sont converties à l'unité de base.
*/

import Decimal from 'decimal.js'
import {
	binarySearchCmp,
	gcd,
	pgcdDecimals,
	primeFactors,
	RadicalReduction,
} from '../utils/utils'
import compare from './compare'
import fraction from './fraction'
import { math } from './math'
import { boolean, notdefined, number, radical, symbol } from './node'
import {
	Bool,
	isAbs,
	isBoolean,
	isBracket,
	isCos,
	isDifference,
	isDivision,
	isEquality,
	isExp,
	isFloor,
	isHole,
	isIdentifier,
	isIncorrectExp,
	isInequalityLess,
	isInequalityLessOrEqual,
	isInequalityMore,
	isInequalityMoreOrEQual,
	isInt,
	isLimit,
	isLn,
	isLog,
	isMax,
	isMaxP,
	isMin,
	isMinP,
	isMod,
	isNlist,
	isNumber,
	isOpposite,
	isPercentage,
	isPGCD,
	isPositive,
	isPower,
	isProduct,
	isProductImplicit,
	isProductPoint,
	isQuotient,
	isRadical,
	isRelations,
	isSin,
	isSum,
	isSymbol,
	isTan,
	isTime,
	isUnequality,
	LogN,
	Nlist,
	NlistElement,
	NlistElements,
	Node,
	Normal,
	Numbr,
	ToNodeArg,
	ToStringArg,
	TYPE_ERROR,
	TYPE_NORMAL,
	TYPE_NPRODUCT,
	TYPE_NSUM,
} from './types'
import { unit } from './unit'

const defaultsToNode: ToNodeArg = { isUnit: false, formatTime: false }

const pNlist: Nlist = {
	type: TYPE_NSUM,
	children: [],
	[Symbol.iterator]() {
		return this.children[Symbol.iterator]()
	},

	// on compare deux listes de même type (NSum NProduct)
	compareTo(l: Nlist) {
		return compare(this, l)
	},

	// TODO: c'est pour des listes ou des formes normales ?
	// TODO: A revoir
	equalsTo(l: Nlist) {
		// if (typeof e === 'string') e = math(e).normal
		// avec ou sans l'unité ?
		return this.string === l.string
	},

	// fusionne deux listes de même type
	merge(l: Nlist) {
		let pos: number
		// on part des fils de this (on enlève les éléments où le coef vaut 0)
		const result = this.children.filter((child) => !child[0].isZero())

		for (const child of l) {
			const base = child[1]
			const coef2 = child[0]
			if (coef2.isZero()) continue
			const bases = result.map((e) => e[1])
			// on cherche où insérer child en comparant les bases
			pos =
				bases.length > 0
					? binarySearchCmp(bases, base, (e, f) => {
							if (isNlist(e)) {
								return e.compareTo(f as Nlist)
							} else {
								return e.compareTo(f as Node)
							}
					  })
					: ~0
			if (pos < 0) {
				// il n'y a pas de base identique
				result.splice(~pos, 0, child)
			} else {
				// on doit fusionner les deux éléments qui ont la même base
				const coef1 = result[pos][0]

				let coef: Nlist | Node
				if (isNlist(coef1)) {
					coef = coef1.merge(coef2 as Nlist) // coef1 est un nSum
				} else {
					const newcoefvalue = fraction(coef1.string)
						.add(fraction(coef2.string))
						.reduce()

					coef = math(newcoefvalue.toString())
				}

				if (coef.isZero()) {
					// on enleve un terme ou un facteur inutile
					result.splice(pos, 1)
				} else {
					result[pos] = [coef, base]
				}
			}
		}
		return this.createList(this.type, result)
	},

	createList(
		type: typeof TYPE_NSUM | typeof TYPE_NPRODUCT,
		children: NlistElements,
	) {
		return type === TYPE_NSUM ? nSum(children) : nProduct(children)
	},

	// symmetrize an element [coef, base]
	symmetrize(this: Nlist) {
		const f = function (
			e: [Nlist | Node, Nlist | Node],
		): [Nlist | Node, Nlist | Node] {
			const coef = e[0]
			const base = e[1]
			let newcoef: Nlist | Node
			if (coef.isZero()) return e
			if (isNlist(coef)) {
				newcoef = coef.oppose()
			} else {
				newcoef = isOpposite(coef) ? coef.first : coef.oppose()
			}
			return [newcoef, base]
		}

		return this.createList(this.type, this.children.map(f))
	},

	get string() {
		return this.toString()
	},

	toString(params?: ToStringArg) {
		return this.node.toString(params)
	},

	isOne() {
		return this.node.isOne()
	},
	isZero() {
		return this.node.isZero()
	},
	isMinusOne() {
		return this.node.isMinusOne()
	},
	isInt() {
		return this.node.isInt()
	},
	isOpposite() {
		return this.node.isOpposite()
	},
	get first() {
		return this.children[0]
	},
	get last() {
		return this.children[this.children.length - 1]
	},
	get length() {
		return this.children.length
	},
	get node() {
		return this.toNode()
	},

	toNode() {
		const nProductElementToNode = function ([coef, base]: [Node, Node]) {
			// normalement coef est différent de 0
			// TODO: mise a jour ds parents ?
			let e = base
			if (coef.string === '1/2') {
				e = radical([base])
			} else if (!base.isOne() && !coef.isOne()) {
				// e = e.pow(coef.isNumber() || coef.isSymbol() ? coef : bracket([coef]))
				if (e.isOpposite()) {
					e = e.bracket()
				}
				e = e.pow(coef)
			}
			return e
		}

		let e: Node
		if (this.type === TYPE_NPRODUCT) {
			e = number(1)
			for (let i = 0; i < this.children.length; i++) {
				const coef = this.children[i][0]
				const base = this.children[i][1]
				let factor = nProductElementToNode([coef as Node, base as Node])

				if (factor.isOpposite() || factor.isSum() || factor.isDifference()) {
					// console.log('factor', factor.string)
					factor = factor.bracket()
				}
				if (i === 0) {
					e = factor
				} else if (!factor.isOne()) {
					// est ce que c'est possible?
					e = e.mult(factor)
				}
			}
		} else {
			// type NSum
			e = number(0)
			for (let i = 0; i < this.children.length; i++) {
				const child = this.children[i]
				let coef = isNlist(child[0]) ? child[0].node : child[0]
				const base = (child[1] as Nlist).node
				let term: Node
				let minus = false
				if (base.isOne()) {
					term = coef
				} else if (coef.isOne()) {
					term = base
				} else if (coef.isMinusOne()) {
					minus = true
					term = base
				} else if (isOpposite(coef)) {
					minus = true
					if (coef.first.isSum() || coef.first.isDifference()) {
						term = coef.first.bracket().mult(base)
					} else {
						term = coef.first.mult(base)
					}
				} else {
					if (coef.isSum() || coef.isDifference()) {
						coef = coef.bracket()
					}
					term = coef.mult(base)
				}
				if (i === 0) {
					e = minus ? term.oppose() : term
				} else {
					e = minus ? e.sub(term) : e.add(term)
				}
			}
		}
		return e
	},

	mult(l: Nlist) {
		let t: NlistElements = []
		if (this.type === TYPE_NPRODUCT) {
			t = t.concat(this.merge(l).children)
			t = t.filter((e) => !e[1].isOne())
			return nProduct(t)
		}
		//  NSum
		else {
			// on boucle d'abord sur les termes des deux sommes que l'on doit multiplier deux à deux
			for (const term1 of this) {
				for (const term2 of l) {
					const coefs: [Node, Nlist][] = []
					// on multiplie les coefs d'un côté, les bases de l'autre
					const coef1 = term1[0] as Nlist // nSum
					const base1 = term1[1] as Nlist // nProduct
					const coef2 = term2[0] as Nlist // nSum
					const base2 = term2[1] as Nlist // nProduct

					// coef1 et coef2 sont des nSum, il faut les multiplier proprement
					for (const [coefcoef1, basecoef1] of coef1) {
						for (const [coefcoef2, basecoef2] of coef2) {
							// coefcoef1 et coefcoef2 sont des nombres, fractions
							// basecoef1 et basecoef2 sont des nProduct
							// TODO: pourquoi ne pas faire les calculs sur des Decimal ?
							// TODO: pourquoi que des valeurs entières ?
							const newcoefvalue =
								parseInt(coefcoef1.string) * parseInt(coefcoef2.string)
							const negative = newcoefvalue < 0
							let coef: Node = number(Math.abs(newcoefvalue))
							let base = (basecoef1 as Nlist).mult(basecoef2 as Nlist)
							if (isNumber(base.node) && !base.node.isOne()) {
								coef = number((coef as Numbr).value.mul(base.node.value))
								base = baseOne()
							}
							if (negative) coef = coef.oppose()
							coefs.push([coef, base])
						}
					}
					// ne pas oublier de merger : (2+racine(3))(3+racine(3)) -> les bases changent de type
					const coef = simpleCoef(number(0)).merge(nSum(coefs))
					// A verfier : (1-x)(1+x)
					// et si l'une des bases  vaut 1 ?
					t.push([coef, base1.mult(base2)])
				}
			}
			return nSumZero().merge(nSum(t))
		}
	},

	add(l: Nlist) {
		return this.merge(l)
	},

	sub(l: Nlist) {
		return this.merge(l.oppose())
	},

	oppose() {
		return this.symmetrize()
	},

	invert() {
		return this.symmetrize()
	},

	div(l: Nlist) {
		return this.frac(l)
	},

	frac(denom: Nlist) {
		return this.mult(denom.invert())
	},
}

const emptyList = Object.create(pNlist)

const pNormal: Normal = {
	type: TYPE_NORMAL,
	get n() {
		return this._n as Nlist
	},
	get d() {
		return this._d as Nlist
	},
	isDefined() {
		return this.type !== TYPE_ERROR
	},
	isZero() {
		return this.isDefined() && this.n.isZero()
	},

	isInt() {
		return this.isDefined() && this.node.isInt()
	},

	isOne() {
		return this.isDefined() && this.node.isOne()
	},

	isProduct() {
		return this.isDefined() && this.node.isProduct()
	},

	isPower() {
		return this.isDefined() && this.node.isPower()
	},

	isDivision() {
		return this.isDefined() && this.node.isDivision()
	},

	isQuotient() {
		return this.isDefined() && this.node.isQuotient()
	},

	isOpposite() {
		return this.isDefined() && this.node.isOpposite()
	},

	isMinusOne() {
		return this.isDefined() && this.node.isMinusOne()
	},

	isNumeric() {
		return this.isDefined() && this.node.isNumeric()
	},

	isDuration() {
		return (
			this.isDefined() &&
			!!this.unit &&
			this.unit.isConvertibleTo(unit('s').normal())
		)
	},
	isLength() {
		return (
			this.isDefined() &&
			!!this.unit &&
			this.unit.isConvertibleTo(unit('m').normal())
		)
	},
	isMass() {
		return (
			this.isDefined() &&
			!!this.unit &&
			this.unit.isConvertibleTo(unit('g').normal())
		)
	},

	// test if two units are the same type
	isConvertibleTo(u: Normal) {
		const u1N = nSum([[simpleCoef(number(1)), this.n.first[1]]])
		const u1D = nSum([[simpleCoef(number(1)), this.d.first[1]]])
		const u1 = normal(u1N, u1D)
		const u2N = nSum([[simpleCoef(number(1)), u.n.first[1]]])
		const u2D = nSum([[simpleCoef(number(1)), u.d.first[1]]])
		const u2 = normal(u2N, u2D)

		return (
			u1.equalsTo(u2) ||
			(u1.string === 'm^3' && u2.string === 'L') ||
			(u1.string === 'L' && u2.string === 'm^3')
		)
	},

	isSameQuantityType(e: Normal) {
		return (
			this.isDefined() &&
			e.isDefined() &&
			((!this.unit && !e.unit) ||
				(!!this.unit && !!e.unit && this.unit.isConvertibleTo(e.unit)))
		)
	},

	getCoefTo(u: Normal) {
		const coefN1 = nSum([[this.n.first[0], baseOne()]])
		const coefD1 = nSum([[this.d.first[0], baseOne()]])
		const coef1 = normal(coefN1, coefD1)
		const coefN2 = nSum([[u.n.first[0], baseOne()]])
		const coefD2 = nSum([[u.d.first[0], baseOne()]])
		const coef2 = normal(coefN2, coefD2)

		const baseN1 = nSum([[nSumOne(), this.n.first[1]]])
		const baseD1 = nSum([[nSumOne(), this.d.first[1]]])
		const base1 = normal(baseN1, baseD1)
		const baseN2 = nSum([[nSumOne(), u.n.first[1]]])
		const baseD2 = nSum([[nSumOne(), u.d.first[1]]])
		const base2 = normal(baseN2, baseD2)
		// console.log('base1', base1.string)
		//   console.log('base2', base2.string)

		let coef = coef1.div(coef2)
		if (base1.string === 'L' && base2.string === 'm^3') {
			// console.log('base1', base1.string)
			// console.log('base2', base2.string)
			coef = coef.mult(math(0.001).normal)
		} else if (base2.string === 'L' && base1.string === 'm^3') {
			// console.log('base1', base1.string)
			// console.log('base2', base2.string)
			coef = coef.mult(math(1000).normal)
		}
		return coef
	},

	// réduit une expression normale correspondant à une fraction numérique
	reduce(this: Normal) {
		if (!this.isDefined()) return this
		// todo : vérifier que c'est bien une fraction numérique
		function lookForPGCDinSum(s: Nlist) {
			let n = new Decimal(0)

			s.children.forEach((term) => {
				const coef = term[0]
				let p: Decimal
				if (isNlist(coef)) {
					p = lookForPGCDinSum(coef)
				} else {
					p = isOpposite(coef)
						? (coef.first as Numbr).value
						: (coef as Numbr).value
				}
				n = !n.isZero() ? pgcdDecimals([n, p]) : p
			})
			return n
		}

		function simplify(s: Nlist, p: Decimal) {
			const terms = s.children.map((term) => {
				let coef = term[0]
				const base = term[1]
				let elmt: NlistElement

				if (isNlist(coef)) {
					coef = simplify(coef, p)
					elmt = [coef, base]
				} else {
					elmt = isOpposite(coef)
						? [number((coef.first as Numbr).value.div(p)).oppose(), base]
						: [number((coef as Numbr).value.div(p)), base]

					// return coef.div(number(p)).eval()
				}
				return elmt
			})
			return nSum(terms)
		}

		const n_pgcd = lookForPGCDinSum(this.n)
		const d_pgcd = lookForPGCDinSum(this.d)

		const p = pgcdDecimals([n_pgcd, d_pgcd])
		let n = simplify(this.n, p)
		let d = simplify(this.d, p)

		let negative = false
		if (n.node.isOpposite()) {
			negative = true
			n = n.oppose()
		}
		if (d.node.isOpposite()) {
			negative = !negative
			d = d.oppose()
		}

		if (negative) n = n.oppose()
		//  console.log('lookup pgcd', this.string, n_pgcd, d_pgcd, p,  n.string)
		return normal(n, d, this.unit)
	},

	add(e: Normal) {
		if (!this.isDefined()) return this
		if (!e.isDefined()) return e
		if (!this.isSameQuantityType(e)) {
			throw new Error("Erreur d'unité")
		}

		return normal(
			this.n.mult(e.d).add(e.n.mult(this.d)),
			this.d.mult(e.d),
			this.unit,
		).reduce()
	},

	sub(e: Normal) {
		if (!this.isDefined()) return this
		if (!e.isDefined()) return e
		if (
			(e.unit && this.unit && !e.unit.equalsTo(this.unit)) ||
			(this.unit && !e.unit) ||
			(!this.unit && e.unit)
		)
			throw new Error("Erreur d'unité")
		return normal(
			this.n.mult(e.d).sub(e.n.mult(this.d)),
			this.d.mult(e.d),
			this.unit,
		).reduce()
	},

	mult(exp: Normal | string | number | Decimal) {
		const e = convertToNormal(exp)
		if (!this.isDefined()) return this
		if (!e.isDefined()) return e
		let unit: Normal | undefined
		if (this.unit && e.unit) unit = this.unit.mult(e.unit)
		else if (this.unit) unit = this.unit
		else unit = e.unit

		if (unit && unit.string === '1') unit = undefined
		return normal(this.n.mult(e.n), e.d.mult(this.d), unit).reduce()
	},

	div(e: Normal) {
		if (!this.isDefined()) return this
		if (!e.isDefined()) return e
		if (e.equalsTo(0)) return createNotDefinedNormal('Division by zero')
		return this.mult(e.invert())
	},

	pow(e: Normal) {
		if (!this.isDefined()) return this
		if (!e.isDefined()) return e
		if (e.isZero()) return normOne(this.unit)
		if (e.isOne()) return this
		if (this.isZero()) return this
		if (this.isOne()) return this
		if (e.isMinusOne()) return this.invert()

		let result: Normal
		if (isInt(e.node)) {
			// e.node.value >=2
			const n = e.node.value.toNumber()
			result = this.mult(this)
			if (n >= 3) {
				for (let i = 1; i < n - 1; i++) {
					result = result.mult(this)
				}
			}
		} else if (isOpposite(e.node) && isInt(e.node.first)) {
			const n = e.node.first.value.toNumber() //n>=2
			result = this.mult(this)
			if (n >= 3) {
				for (let i = 1; i < n - 1; i++) {
					result = result.mult(this)
				}
			}
			result = result.invert()
		} else if (isProduct(this.node)) {
			const factors = this.node.factors.map((factor) => factor.normal)
			result = (factors.shift() as Normal).pow(e)
			factors.forEach((factor) => {
				result = result.mult(factor.pow(e))
			})
		} else if (this.isQuotient() || this.isDivision()) {
			result = this.n.node.normal.pow(e).div(this.d.node.normal.pow(e))
		} else if (isPower(this.node)) {
			// const exp= fraction(this.node.last.string)
			const exp = this.node.last.mult(e.node).eval()
			result = this.node.first.normal.pow(exp.normal)
		} else if (e.equalsTo(number(0.5).normal) && isInt(this.node)) {
			if (this.node.value.sqrt().isInt()) {
				result = number(this.node.value.sqrt()).normal
			} else {
				const n = this.node.value.toNumber()
				const k = RadicalReduction(n)
				if (k === 1) {
					const coef = nSum([[number(1), createBase(this.node, e.node)]])
					const n = nSum([[coef, baseOne()]])
					const d = nSumOne()
					result = normal(n, d)
				} else {
					result = number(k).mult(number(n / (k * k)).pow(number(0.5))).normal
				}
			}
		} else if (
			isOpposite(e.node) &&
			e.node.first.equals(number(0.5)) &&
			isInt(this.node) &&
			this.node.value.sqrt().isInt()
		) {
			result = number(this.node.value.sqrt().toNumber()).normal.invert()
		} else {
			// TODO: parenthèses ??
			let n: Nlist, d: Nlist
			if (this.isNumeric() && e.isNumeric()) {
				const coef = nSum([[number(1), createBase(this.node, e.node)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				n = nSum([[coefOne(), createBase(this.node, e.node)]])
				d = nSumOne()
			}

			// TODO: et l'unité ???
			result = normal(n, d)
		}
		return result
	},

	oppose() {
		if (!this.isDefined()) return this
		return normal(this.n.oppose(), this.d, this.unit)
	},

	invert() {
		if (!this.isDefined()) return this
		const unit = this.unit ? this.unit.invert() : undefined
		let n: Nlist
		let d: Nlist
		if (this.n.length === 1) {
			const coef = this.n.first[0]
			d = nSum([[coef, baseOne()]])
			const base = (this.n.first[1] as Nlist).symmetrize()
			n = nSum([[coefOne(), base]])
		} else {
			n = nSumOne()
			d = this.n
		}
		n = n.mult(this.d)
		// }
		return normal(n, d, unit).reduce()
	},

	compareTo(e: Normal) {
		if (!this.isDefined()) return 1
		if (!e.isDefined()) return -1
		return compare(this, e)
	},

	get node() {
		return (this as Normal).toNode()
	},

	//  si la forme représente une fraction numérique, celle-ci a été simplifiée et le signe
	// est au numérateur
	toNode({ formatTime }: ToNodeArg = defaultsToNode) {
		if (!this.isDefined()) return notdefined(this.error as string)
		let e: Node
		let n = this.n.node
		const d = this.d.node

		if (d.isOne()) {
			e = n
		} else {
			let positive = true
			if (isOpposite(n)) {
				positive = false
				n = n.first
			}

			e = n.frac(d)
			if (!positive) e = e.oppose()
		}

		if (this.unit) {
			if (formatTime) {
				let s = ''
				let ms = (e as Numbr).value.toNumber()
				const ans = Math.floor(ms / 31536000000)
				if (ans) s += ans + ' ans '
				ms = ms % 31536000000
				const jours = Math.floor(ms / 86400000)
				if (jours) s += jours + ' jours '
				ms = ms % 86400000
				const heures = Math.floor(ms / 3600000)
				if (heures) s += heures + ' h '
				ms = ms % 3600000
				const minutes = Math.floor(ms / 60000)
				if (minutes) s += minutes + ' min '
				ms = ms % 60000
				const secondes = Math.floor(ms / 1000)
				if (secondes) s += secondes + ' s '
				ms = ms % 1000
				if (ms) s += ms + ' ms '

				e = math(s)
			} else {
				e.unit = math(
					'1' + this.unit.toNode({ isUnit: true }).toString({ isUnit: true }),
				).unit
			}
		}

		return e
	},

	get string() {
		return (this as Normal).node.string
	},

	equalsTo(exp: Normal | string | number) {
		if (!this.isDefined()) return false
		const e = convertToNormal(exp)
		if (!e.isDefined()) return false
		return this.n.mult(e.d).equalsTo(this.d.mult(e.n))
	},
}

function createNotDefinedNormal(error: string) {
	return Object.assign(Object.create(pNormal), {
		type: TYPE_ERROR,
		error,
	})
}
function normal(n: Nlist, d: Nlist, unit?: Normal) {
	const o = Object.create(pNormal)
	if (!d) d = nSumOne()
	Object.assign(o, {
		_n: n,
		_d: d,
		unit,
		type: TYPE_NORMAL,
	})
	return o as Normal
}

/**
 * Les formes normales sont exprimées sous la forme de sommes de produits
 * Les sommes et les produits sont sous forme de listes dont les éléments comportent deux parties : un coefficient et une base
 * pour les produits, le coefficient correspond à l'exposant.
 * Attention, un coefficient peut très bien lui aussi s'exprimer sous la forme d'une somme, par exemple pour pouvoir
 * travailler avec des expressions de la forme (2+racine(3))*x
 * nSum = [ [coef, base], ...] où coef est un nSum (où les coefs sont des entiers) et base un nProduct
 * nProduct = [ [coef, base], ...] où coef est un nSum et base une expression
 * Exemples de formes normales :
 * one et number(0) sont des expressions représentant les nombres 1 et 0
 *
 * nSum([ [ nSum([[number(0), one]]), nProduct() ] ])
 * 0 =0*1^1-> [ [ [[0,1]], [[1, 1]] ] ]
 * 1 = 1*1^1-> [ [ [[1, 1]], [[1, 1]] ] ]
 * 2 = 2*1^1-> [ [ [[2, 1]], [[1, 1]] ] ]
 * racine(2) = racine(2)*1^1-> [ [ [[1, racine(2)]], [[1, 1]] ] ]
 * 3*racine(2) = 3*racine(2)*1^1-> [ [ [[3, racine(2)]], [[1, 1]] ] ]
 * 5 + 3*racine(2) -> [ [[[5, 1]], [[1, 1]]],   [[[3, racine(2)]], [[1, 1]]] ]
 * x = 1*x^1-> [ [ [[1, 1]], [[1, x]] ] ]
 * x^2 = 1*x^2-> [ [ [[1, 1]], [[2, x]] ] ]
 * 2x = 2*x^1-> [ [ [[2, 1]], [[1, x]] ] ]
 * 1+x -> [ [ [[1, 1]], [[1, 1]] ], [ [[1, 1]], [[1, x]] ] ]
 * x*y -> [ [ [[1, 1]], [[1, x], [1,y]] ] ]
 */

/**
 * Prototype des formes normales intermédiaires
 */

/**
 * Constantes utilisées
 */
function baseOne() {
	return nProduct([[number(1), number(1)]])
}

function simpleCoef(coef: Node) {
	return nSum([[coef, baseOne()]])
}

function coefOne() {
	return simpleCoef(number(1))
}

function coefZero() {
	return simpleCoef(number(0))
}

function nSumOne() {
	return nSum([[coefOne(), baseOne()]])
}

function nSumZero() {
	return nSum([[coefZero(), baseOne()]])
}

// forme normale du nombre 1 - singleton
function normOne(unit?: Normal) {
	return normal(nSumOne(), nSumOne(), unit)
}

function nProduct(children: NlistElements) {
	const o: Nlist = Object.create(pNlist)
	Object.assign(o, {
		type: TYPE_NPRODUCT,
		children:
			!children || children.length === 0 ? [[number(1), number(1)]] : children,
	})
	return o
}

function nSum(children: NlistElements) {
	const o: Nlist = Object.create(pNlist)

	Object.assign(o, {
		type: TYPE_NSUM,
		children:
			!children || children.length === 0 ? nSumZero().children : children,
	})
	return o
}

function createBase(b: Node, e?: Node) {
	return nProduct([[e || number(1), b]])
}

export default function normalize(node: Node): Normal {
	let d: Nlist = emptyList // dénominateur de la partie normale
	let n: Nlist = emptyList // numérateur de la partie normale
	let e: Normal | null = null // forme normale retournée

	// pose des problèmes de prototypes
	// const { unit, ...others } = node // ? est-ce qu'on se débarrasse de la forme normale?
	// others.proto

	if (isIncorrectExp(node)) {
		e = createNotDefinedNormal('Incorrect expression')
	} else if (isLimit(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isTime(node)) {
		const children = node.children.map((c) => c.normal)
		e = children.pop() as Normal
		while (children.length) {
			e = e.add(children.pop() as Normal)
		}
	} else if (isBoolean(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isNumber(node)) {
		if (node.isInt()) {
			n = nSum([[simpleCoef(number(node.value)), baseOne()]])
			d = nSumOne()
		} else {
			// on convertit le float en fraction
			e = math(fraction(node).toString()).normal
		}
	} else if (isPower(node)) {
		e = node.first.normal.pow(node.last.normal)
	} else if (isRadical(node)) {
		e = node.first.normal.pow(number(0.5).normal)
	} else if (isCos(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (childNormal.equalsTo(0) || childNormal.equalsTo('2pi')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('pi') || childNormal.equalsTo('-pi')) {
			e = math(-1).normal
		} else if (childNormal.equalsTo('pi/2') || childNormal.equalsTo('-pi/2')) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/3') || childNormal.equalsTo('-pi/3')) {
			e = math(0.5).normal
		} else if (
			childNormal.equalsTo('2pi/3') ||
			childNormal.equalsTo('-2pi/3')
		) {
			e = math(-0.5).normal
		} else if (childNormal.equalsTo('pi/4') || childNormal.equalsTo('-pi/4')) {
			e = math('sqrt(2)/2').normal
		} else if (
			childNormal.equalsTo('3pi/4') ||
			childNormal.equalsTo('-3pi/4')
		) {
			e = math('-sqrt(2)/2').normal
		} else if (childNormal.equalsTo('pi/6') || childNormal.equalsTo('-pi/6')) {
			e = math('sqrt(3)/2').normal
		} else if (
			childNormal.equalsTo('5pi/6') ||
			childNormal.equalsTo('-5pi/6')
		) {
			e = math('-sqrt(3)/2').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isSin(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (
			childNormal.equalsTo(0) ||
			childNormal.equalsTo('2pi') ||
			childNormal.equalsTo('pi') ||
			childNormal.equalsTo('-pi')
		) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/2')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('-pi/2')) {
			e = math(-1).normal
		} else if (childNormal.equalsTo('pi/6') || childNormal.equalsTo('5pi/6')) {
			e = math(0.5).normal
		} else if (
			childNormal.equalsTo('-pi/6') ||
			childNormal.equalsTo('-5pi/6')
		) {
			e = math(-0.5).normal
		} else if (childNormal.equalsTo('pi/4') || childNormal.equalsTo('3pi/4')) {
			e = math('sqrt(2)/2').normal
		} else if (
			childNormal.equalsTo('-pi/4') ||
			childNormal.equalsTo('-3pi/4')
		) {
			e = math('-sqrt(2)/2').normal
		} else if (childNormal.equalsTo('pi/3') || childNormal.equalsTo('2pi/3')) {
			e = math('sqrt(3)/2').normal
		} else if (
			childNormal.equalsTo('-pi/3') ||
			childNormal.equalsTo('-2pi/3')
		) {
			e = math('-sqrt(3)/2').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isTan(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (childNormal.equalsTo(0)) {
			e = math(0).normal
		} else if (childNormal.equalsTo('pi/6')) {
			e = math('1/sqrt(3)').normal
		} else if (childNormal.equalsTo('-pi/6')) {
			e = math('-1/sqrt(3)').normal
		} else if (childNormal.equalsTo('pi/4')) {
			e = math(1).normal
		} else if (childNormal.equalsTo('-pi/4')) {
			e = math('-1').normal
		} else if (childNormal.equalsTo('pi/3')) {
			e = math('sqrt(3)').normal
		} else if (childNormal.equalsTo('-pi/3')) {
			e = math('-sqrt(3)').normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isLn(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (isExp(child)) {
			e = child.first.normal
		} else if (isPower(child)) {
			e = child.last.mult(child.first.ln()).normal
		} else if (childNormal.equalsTo(1)) {
			e = math(0).normal
		} else if (childNormal.equalsTo('e')) {
			e = math(1).normal
		} else if (isInt(child)) {
			const N = child.value.toNumber()
			const factors = primeFactors(N)
			if (factors.length === 1 && factors[0][1] === 1) {
				const base = node.copy([child])
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				e = math(0).normal
				e = e.add(number(0).normal)
				factors.forEach((factor) => {
					const [a, k] = factor
					const term = math(`${k}*ln(${a})`).normal
					e = (e as Normal).add(term)
				})
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isExp(node)) {
		const child = node.first
		const childNormal = child.normal

		if (isProduct(child) && (isLn(child.first) || isLn(child.last))) {
			if (isLn(child.first)) {
				e = child.first.first.pow(child.last).normal
			} else {
				e = (child.last as LogN).first.pow(child.first).normal
			}
		} else if (isLn(child)) {
			e = child.first.normal
		} else if (childNormal.equalsTo(0)) {
			e = math(1).normal
		} else {
			const base = node.copy([childNormal.node])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isAbs(node)) {
		const child = node.first
		const childNormal = child.normal
		if (child.isNumeric()) {
			if (child.isLowerThan(0)) {
				e = childNormal.mult(-1)
			} else {
				e = childNormal
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			n = nSum([[coefOne(), createBase(base)]])
		}
	} else if (isLog(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node

		if (isPower(child)) {
			e = child.last.mult(child.first.log()).normal
		} else if (childNormal.equalsTo(1)) {
			e = math(0).normal
		} else if (childNormal.equalsTo(10)) {
			e = math(1).normal
		} else if (isInt(child)) {
			const N = child.value.toNumber()
			const factors = primeFactors(N)
			if (factors.length === 1 && factors[0][1] === 1) {
				const base = node.copy([child])
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			} else {
				e = math(0).normal
				factors.forEach((factor) => {
					const [a, k] = factor
					const term = math(`${k}*log(${a})`).normal
					e = (e as Normal).add(term)
				})
			}
		} else {
			const base = node.copy([child])
			d = nSumOne()
			if (child.isNumeric()) {
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
			} else {
				n = nSum([[coefOne(), createBase(base)]])
			}
		}
	} else if (isFloor(node)) {
		const childNormal = node.children[0].normal
		const child = childNormal.node
		if (child.isNumeric()) {
			e = number((child.eval({ decimal: true }) as Numbr).value.floor()).normal
		} else {
			const base = node.copy([child])
			d = nSumOne()
			n = nSum([[coefOne(), createBase(base)]])
		}
	} else if (isPGCD(node)) {
		const children = node.children.map((c) => c.normal.node)
		let a = children[0]
		let b = children[1]
		if (node.isNumeric()) {
			if (isOpposite(a) && a.first.isInt()) {
				a = a.first
			}
			if (isOpposite(b) && b.first.isInt()) {
				b = b.first
			}
			if (isInt(a) && isInt(b)) {
				e = number(gcd(a.value.toNumber(), b.value.toNumber())).normal
			} else {
				const base = node.copy(children)
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			}
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMod(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]
		if (node.isNumeric()) {
			if (
				(isInt(a) || (isOpposite(a) && a.first.isInt())) &&
				(isInt(b) || (isOpposite(b) && b.first.isInt()))
			) {
				e = number(new Decimal(a.string).mod(new Decimal(b.string))).normal
			} else {
				const base = node.copy(children)
				const coef = nSum([[number(1), createBase(base)]])
				n = nSum([[coef, baseOne()]])
				d = nSumOne()
			}
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMin(node) || isMinP(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]
		if (node.isNumeric()) {
			e = a.isLowerThan(b) ? a.normal : b.normal
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isMax(node) || isMaxP(node)) {
		const children = node.children.map((c) => c.normal.node)
		const a = children[0]
		const b = children[1]

		if (node.isNumeric()) {
			e = a.isGreaterThan(b) ? a.normal : b.normal
		} else {
			const base = node.copy(children)
			n = nSum([[coefOne(), createBase(base)]])
			d = nSumOne()
		}
	} else if (isPercentage(node)) {
		e = node.first.div(number(100)).normal
	} else if (isHole(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isIdentifier(node)) {
		n = nSum([[coefOne(), createBase(node)]])
		d = nSumOne()
	} else if (isSymbol(node)) {
		n = nSum([
			[coefOne(), createBase(symbol(node.toString({ displayUnit: false })))],
		])
		d = nSumOne()
	} else if (isBracket(node) || isPositive(node)) {
		e = normalize(node.first)
	} else if (isOpposite(node)) {
		e = node.first.normal
		if (!e.node.isZero()) e = e.oppose() // pour ne pas avoir un -0
	} else if (isSum(node)) {
		e = node.children[0].normal
		for (let i = 1; i < node.children.length; i++) {
			e = e.add(node.children[i].normal)
		}
	} else if (
		isProduct(node) ||
		isProductImplicit(node) ||
		isProductPoint(node)
	) {
		e = number(1).normal
		for (let i = 0; i < node.children.length; i++) {
			e = e.mult(node.children[i].normal)
		}
	} else if (isDifference(node)) {
		e = node.first.normal.sub(node.last.normal)
	} else if (isDivision(node) || isQuotient(node)) {
		e = node.first.normal.div(node.last.normal)
	} else if (isRelations(node)) {
		let bool = true
		// console.log('node', node)
		node.ops.forEach((op, i) => {
			const test = math(node.children[i].string + op + node.children[i + 1])
			bool = bool && (test.eval() as Bool).boolvalue
		})
		e = boolean(bool).normal
	} else if (isUnequality(node)) {
		e = boolean(!node.first.eval().equals(node.last.eval())).normal
	} else if (isEquality(node)) {
		e = boolean(node.first.eval().equals(node.last.eval())).normal
	} else if (isInequalityLess(node)) {
		e = boolean(node.first.eval().isLowerThan(node.last.eval())).normal
	} else if (isInequalityMore(node)) {
		e = boolean(node.first.eval().isGreaterThan(node.last.eval())).normal
	} else if (isInequalityLessOrEqual(node)) {
		e = boolean(node.first.eval().isLowerOrEqual(node.last.eval())).normal
	} else if (isInequalityMoreOrEQual(node)) {
		e = boolean(node.first.eval().isGreaterOrEqual(node.last.eval())).normal
	}

	// TODO: et les TEMPLATES?
	else {
		e = createNotDefinedNormal('Impossible to normalize ' + node.string)
	}

	if (!e) {
		e = normal(n, d)
	}
	if (node.unit) {
		// TODO : et quand les opérandes ont aussi une unité ?
		// console.log('node', node)
		// console.log('node.unit', node.unit)

		let u = node.unit.normal()
		//  on récupère le coefficeient de l'unité et on l'applique à la forme normale
		const coefN = nSum([[u.n.first[0], baseOne()]])
		const coefD = nSum([[u.d.first[0], baseOne()]])
		const coef = normal(coefN, coefD)
		const uN = nSum([[simpleCoef(number(1)), u.n.first[1]]])
		const uD = nSum([[simpleCoef(number(1)), u.d.first[1]]])
		u = normal(uN, uD)
		e = e.mult(coef)
		//  TODO: Pourquoi comparer à 1 ?
		if (u.string !== '1') {
			e.unit = u
		}
	}
	return e
}

function convertToNormal(exp: Normal | string | number | Decimal) {
	let e: Normal
	if (
		typeof exp === 'string' ||
		typeof exp === 'number' ||
		Decimal.isDecimal(exp)
	) {
		e = math(exp).normal
	} else {
		e = exp
	}
	return e
}

function shallowClone(obj: object) {
	return Object.create(
		Object.getPrototypeOf(obj),
		Object.getOwnPropertyDescriptors(obj),
	)
}
