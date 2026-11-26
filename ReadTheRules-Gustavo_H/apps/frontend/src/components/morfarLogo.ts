import { gsap } from "@/lib/gsap";

type Particula = { sx: number; sy: number; ex: number; ey: number; cx: number; cy: number; atraso: number; cor: string };

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Desfaz a logo em partículas (os próprios pixels dela) no retângulo `de`
 * e a remonta no retângulo `para`. O canvas cobre a tela inteira.
 */
export function morfarLogo(img: HTMLImageElement, de: DOMRect, para: DOMRect, canvas: HTMLCanvasElement, duracao = 1.4) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Amostra a logo no tamanho em que aparece na tela.
  const w = Math.max(1, Math.round(de.width));
  const h = Math.max(1, Math.round(de.height));
  const fora = document.createElement("canvas");
  fora.width = w;
  fora.height = h;
  const fctx = fora.getContext("2d", { willReadFrequently: true })!;
  fctx.drawImage(img, 0, 0, w, h);
  const px = fctx.getImageData(0, 0, w, h).data;

  const passo = Math.max(2, Math.round(w / 170));
  const escalaX = para.width / de.width;
  const escalaY = para.height / de.height;
  const indoParaDireita = para.left > de.left;
  const particulas: Particula[] = [];

  for (let y = 0; y < h; y += passo) {
    for (let x = 0; x < w; x += passo) {
      const i = (y * w + x) * 4;
      if (px[i + 3] < 110) continue;
      // Cores agrupadas em poucos tons para trocar menos o fillStyle.
      const q = (v: number) => Math.min(255, Math.round(v / 24) * 24);
      const sx = de.left + x, sy = de.top + y;
      const ex = para.left + x * escalaX, ey = para.top + y * escalaY;
      const lado = x / w;
      particulas.push({
        sx, sy, ex, ey,
        // Ponto de controle: as peças se soltam para cima/baixo e cruzam a tela num arco.
        cx: (sx + ex) / 2 + (Math.random() - 0.5) * 160,
        cy: (sy + ey) / 2 + (Math.random() - 0.5) * innerHeight * 0.55,
        // Começa a se desfazer pelo lado que fica de frente para o destino.
        atraso: (indoParaDireita ? 1 - lado : lado) * 0.55 + Math.random() * 0.2,
        cor: `rgb(${q(px[i])},${q(px[i + 1])},${q(px[i + 2])})`,
      });
    }
  }
  particulas.sort((a, b) => (a.cor < b.cor ? -1 : 1));

  const estado = { p: 0 };
  const tam = passo * Math.max(escalaX, 1);
  const desenhar = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let cor = "";
    for (const pt of particulas) {
      const t = suave(Math.min(1, Math.max(0, (estado.p * 1.75 - pt.atraso) / 1)));
      const u = 1 - t;
      const x = u * u * pt.sx + 2 * u * t * pt.cx + t * t * pt.ex;
      const y = u * u * pt.sy + 2 * u * t * pt.cy + t * t * pt.ey;
      if (pt.cor !== cor) ctx.fillStyle = cor = pt.cor;
      // No meio do voo cada peça encolhe um pouco, como uma faísca.
      const s = tam * (1 - 0.45 * Math.sin(t * Math.PI));
      ctx.fillRect(x, y, s, s);
    }
  };

  return new Promise<void>((fim) => {
    gsap.to(estado, {
      p: 1,
      duration: duracao,
      ease: "none",
      onUpdate: desenhar,
      onComplete: () => { ctx.clearRect(0, 0, innerWidth, innerHeight); fim(); },
    });
  });
}
