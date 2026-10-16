"""Generate the original, local vector artwork for CASE 02.

Only SVG illustration files are written. No external images, logos, fonts, or
copyrighted characters are embedded. All shapes are authored for this project.
"""
from pathlib import Path
from math import sin, cos, pi
import html

ROOT = Path(__file__).resolve().parents[1]
NAVY = '#101923'
GOLD = '#D9B978'
PAPER = '#E8D9BF'

DEFS = '''<defs>
  <linearGradient id="paper" x2=".85" y2="1"><stop stop-color="#f7ecd7"/><stop offset=".5" stop-color="#e8d9bf"/><stop offset="1" stop-color="#bca789"/></linearGradient>
  <linearGradient id="folder" x2=".8" y2="1"><stop stop-color="#d5bc88"/><stop offset=".55" stop-color="#b39765"/><stop offset="1" stop-color="#8a704a"/></linearGradient>
  <linearGradient id="navy" x2=".6" y2="1"><stop stop-color="#293c4b"/><stop offset="1" stop-color="#0b121a"/></linearGradient>
  <linearGradient id="metal" x2="1" y2=".6"><stop stop-color="#8c9493"/><stop offset=".3" stop-color="#d7d3c5"/><stop offset=".55" stop-color="#5e696a"/><stop offset="1" stop-color="#c0bcad"/></linearGradient>
  <linearGradient id="gold" x2=".8" y2="1"><stop stop-color="#f3dba0"/><stop offset=".5" stop-color="#d9b978"/><stop offset="1" stop-color="#8d6c35"/></linearGradient>
  <linearGradient id="coffee" x2=".4" y2="1"><stop stop-color="#442b1e"/><stop offset=".7" stop-color="#211713"/><stop offset="1" stop-color="#775133"/></linearGradient>
  <linearGradient id="wood" x2="0" y2="1"><stop stop-color="#624632"/><stop offset=".5" stop-color="#382b25"/><stop offset="1" stop-color="#211e1d"/></linearGradient>
  <radialGradient id="light"><stop stop-color="#f7d693" stop-opacity=".5"/><stop offset=".6" stop-color="#d9b978" stop-opacity=".13"/><stop offset="1" stop-color="#d9b978" stop-opacity="0"/></radialGradient>
  <radialGradient id="ceramic"><stop stop-color="#f5eddb"/><stop offset=".72" stop-color="#e1d5bd"/><stop offset="1" stop-color="#8f8980"/></radialGradient>
  <linearGradient id="glass" x2=".8" y2="1"><stop stop-color="#769697"/><stop offset=".35" stop-color="#29434b"/><stop offset="1" stop-color="#10252e"/></linearGradient>
  <pattern id="fiber" width="16" height="13" patternUnits="userSpaceOnUse"><path d="M2 3h2m7 5h3M5 11h1" stroke="#6c5e49" stroke-opacity=".12" stroke-width=".65"/></pattern>
  <pattern id="grain" width="220" height="85" patternUnits="userSpaceOnUse"><path d="M-20 8Q40 0 110 10T250 7M-30 28Q50 19 120 30T260 25M-15 60Q55 49 130 61T250 57M0 76Q50 71 150 78" fill="none" stroke="#d0a276" stroke-opacity=".12" stroke-width="1.3"/><path d="M0 40Q40 33 95 43T230 42" fill="none" stroke="#0a1017" stroke-opacity=".3" stroke-width="2"/></pattern>
  <filter id="shadow" x="-.3" y="-.3" width="1.6" height="1.6"><feDropShadow dx="0" dy="13" stdDeviation="12" flood-color="#02070a" flood-opacity=".5"/></filter>
  <filter id="soft" x="-.5" y="-.5" width="2" height="2"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="smallShadow" x="-.25" y="-.25" width="1.5" height="1.5"><feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#030608" flood-opacity=".4"/></filter>
</defs>'''

def text(x, y, value, size=16, color=NAVY, extra=''):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Georgia,serif" font-size="{size}" {extra}>{html.escape(value)}</text>'

def svg(width, height, body, title, extra_defs=''):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{html.escape(title)}">{DEFS}{extra_defs}{body}</svg>'''

def write(rel, width, height, body, title, extra_defs=''):
    target = ROOT / 'assets' / 'images' / rel
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(svg(width, height, body, title, extra_defs), encoding='utf-8')

def fingerprint(cx, cy, scale=1, color=NAVY, opacity=.5):
    paths = []
    for i in range(11):
        rx, ry = 9+i*4.5, 14+i*5.7
        paths.append(f'<path d="M{cx-rx:.1f} {cy+ry*.4:.1f}C{cx-rx*1.3:.1f} {cy-ry:.1f},{cx+rx*1.4:.1f} {cy-ry*1.15:.1f},{cx+rx:.1f} {cy+ry*.45:.1f}Q{cx+rx*.8:.1f} {cy+ry*.9:.1f},{cx+rx*.35:.1f} {cy+ry:.1f}"/>')
    return f'<g transform="translate({cx*(1-scale)} {cy*(1-scale)}) scale({scale})" fill="none" stroke="{color}" stroke-width="1.5" opacity="{opacity}">{"".join(paths)}</g>'

def bean(x,y,scale=1,angle=0):
    return f'<g transform="translate({x} {y}) rotate({angle}) scale({scale})"><ellipse rx="12" ry="8" fill="#281c17" stroke="#79513a" stroke-width="1.2"/><path d="M-8 2Q-1-5 7-2" fill="none" stroke="#b37e51" stroke-opacity=".65" stroke-width="1.4"/></g>'

def photo_cafe(x,y,w=400,h=300,angle=0):
    # A fictional cafe exterior, with no real-world brand or location.
    kx,ky=w/400,h/300
    windows=''.join(f'<rect x="{31+i*85}" y="84" width="65" height="112" rx="2" fill="#bda16c"/><rect x="{37+i*85}" y="90" width="53" height="100" fill="url(#glass)"/><path d="M{63+i*85} 90v100m-26-50h53" stroke="#c8b68e" stroke-width="3"/>' for i in range(4))
    return f'''<g transform="translate({x} {y}) rotate({angle}) scale({kx} {ky})" filter="url(#smallShadow)"><rect x="-14" y="-14" width="428" height="342" fill="#dfd8c6"/><rect width="400" height="300" fill="#0d1b26"/><path d="M0 0h400v220H0z" fill="#26313a"/><path d="M0 42h400M0 69h400M0 211h400" stroke="#b6a280" stroke-opacity=".4" stroke-width="3"/>{windows}<path d="M0 65h400l-17 22H15z" fill="#2c4546"/><path d="M11 66h375" stroke="#d3b67c" stroke-width="3"/>{text(200,54,'NOIR CAFÉ',22,GOLD,'text-anchor="middle" letter-spacing="5"')}<rect y="220" width="400" height="80" fill="#14212a"/><path d="M0 250 400 268M0 283l400-27M35 220l-35 80m130-80-60 80m160-80-46 80m144-80-4 80" stroke="#52615e" stroke-opacity=".5"/><path d="M37 226l20 48m70-51 33 64m46-64 30 48m67-44 32 60" stroke="#cbb277" stroke-opacity=".25" stroke-width="13"/><circle cx="352" cy="110" r="43" fill="url(#light)"/><path d="M350 80v44" stroke="#bdad8b" stroke-width="3"/><path d="M335 105h30l-5-17h-20z" fill="#d6ba82"/><path d="M0 17l60-17M310 0l90 32" stroke="#78928f" stroke-opacity=".3"/><path d="M0 0h400v300H0z" fill="url(#fiber)"/>{text(200,319,'RECOVERED PHOTOGRAPH',11,'#685d4f','text-anchor="middle" letter-spacing="2"')}</g>'''

def make_mark():
    write('ui/case-mark.svg',128,128,'''<rect width="128" height="128" rx="25" fill="#101923"/><rect x="12" y="12" width="104" height="104" rx="17" fill="none" stroke="#d9b978" stroke-width="1.5"/><path d="M28 40h30l8 8h34v47H28z" fill="#d9b978"/><path d="M28 48h72v47H28z" fill="#b59962"/><path d="M35 57h58v29H35z" fill="#18232d"/><text x="64" y="80" font-family="Georgia,serif" font-size="29" text-anchor="middle" fill="#e8d9bf">02</text><path d="M35 28h58M35 103h58" stroke="#d9b978" stroke-opacity=".5"/>''','CASE 02 investigation folder')

def make_dossier():
    b=['<ellipse cx="466" cy="750" rx="372" ry="210" fill="#03080d" opacity=".5" filter="url(#soft)"/>']
    b.append('''<g transform="rotate(5 460 520)" filter="url(#shadow)"><path d="M172 106h309l32-43h197q31 0 31 31v775q0 32-32 32H173q-31 0-31-31V137q0-31 30-31z" fill="url(#folder)"/><path d="M153 131h580v742H153z" fill="url(#fiber)"/><path d="M164 137v716q0 25 25 25h524" fill="none" stroke="#ead5a6" stroke-opacity=".65" stroke-width="2"/><path d="M184 839h519" stroke="#6f5738" stroke-width="2"/>
    <rect x="189" y="151" width="302" height="50" fill="#ded0a9" opacity=".65"/>
    <text x="210" y="185" font-family="Georgia,serif" font-size="24" letter-spacing="7" fill="#302b23">CONFIDENTIAL</text>
    <path d="M205 216h150m-150 7h214m-214 7h185" stroke="#5b4d39" stroke-width="2" opacity=".5"/>
    <g transform="rotate(-6 620 735)" opacity=".7"><rect x="516" y="702" width="178" height="80" fill="none" stroke="#7a342d" stroke-width="4"/><text x="605" y="735" fill="#7a342d" text-anchor="middle" font-family="Georgia,serif" font-size="21" letter-spacing="3">EYES ONLY</text><text x="605" y="762" fill="#7a342d" text-anchor="middle" font-family="Georgia,serif" font-size="12" letter-spacing="3">FIELD DIVISION</text></g></g>''')
    b.append(photo_cafe(78,282,430,320,-12))
    b.append('''<g transform="translate(441 309) rotate(10)" filter="url(#smallShadow)"><path d="M0 0h275v324l-21 14H8l-8-9z" fill="url(#paper)"/><path d="M0 0h275v338H0z" fill="url(#fiber)"/><path d="M20 61h236M20 89h236M20 117h236M20 145h236M20 173h236M20 201h236M20 229h236M20 257h236M20 285h236" stroke="#7b8a86" stroke-opacity=".18"/><text x="22" y="38" fill="#243340" font-family="Georgia,serif" font-style="italic" font-size="23">Follow what remains.</text><path d="M25 80q18-18 34-3t25-6m8 5q16-17 29-1t24-10m9 6q17-5 30 3t40-5M24 107q14-8 29-1t24-11m7 11q28-17 46-2t35-6m12 8 45-6M24 137q12-15 28-4t33-5m10 6q22-12 37-4t31-2m9 2 42-4M25 165q21-17 39-1t30-7m13 6q15-14 27-2t40-7M24 193q18-11 32-2t21-9m12 8q16-9 34-1t49-8m10 9 46-8" fill="none" stroke="#354552" stroke-width="1.8" stroke-linecap="round"/><path d="M24 226h180m-176 2 131 4" stroke="#7e3d35" stroke-width="2" opacity=".65"/><text x="27" y="273" font-family="Georgia,serif" font-style="italic" font-size="17" fill="#44515a">Trust the evidence.</text><path d="M183 301q16-19 35-2t22-8" fill="none" stroke="#354552" stroke-width="2"/></g>''')
    b.append('''<g transform="translate(144 666) rotate(-8)"><rect width="260" height="193" fill="url(#paper)" filter="url(#smallShadow)"/><rect x="13" y="13" width="234" height="167" fill="none" stroke="#8c8778" stroke-width="1"/><path d="M26 155h77m-77 8h52" stroke="#73766e" stroke-width="2"/><text x="133" y="167" font-family="monospace" font-size="12" letter-spacing="2" fill="#576059">TRACE FILE</text>'''+fingerprint(129,84,.8,NAVY,.6)+'</g>')
    b.append('''<g fill="none" stroke="#893f37" stroke-width="3" opacity=".9"><path d="M297 279Q450 215 600 339L290 756"/><path d="M295 280Q489 326 627 568L290 756"/></g><g fill="#d2bc8d" stroke="#795b37" stroke-width="2"><circle cx="297" cy="279" r="9"/><circle cx="600" cy="339" r="9"/><circle cx="627" cy="568" r="8"/><circle cx="290" cy="756" r="8"/></g><g fill="#f0dcb5"><circle cx="294" cy="276" r="3"/><circle cx="597" cy="336" r="3"/></g>''')
    b.append('''<g transform="translate(641 808) rotate(13)" filter="url(#smallShadow)"><ellipse rx="127" ry="106" fill="#0a1118" opacity=".4" transform="translate(6 12)"/><ellipse rx="120" ry="99" fill="url(#ceramic)"/><ellipse rx="92" ry="76" fill="none" stroke="#a69d88" stroke-width="2"/><path d="M75-24C139-51 137 43 78 30" fill="none" stroke="#d1c7b2" stroke-width="23"/><ellipse rx="80" ry="69" fill="#b0a48e"/><ellipse cy="-5" rx="75" ry="64" fill="#efE5cc"/><ellipse cy="-8" rx="65" ry="54" fill="url(#coffee)"/><ellipse cy="-9" rx="60" ry="49" fill="none" stroke="#bb905c" stroke-opacity=".7" stroke-width="4"/><path d="M-33-13q23-33 47-4t-18 38q-39-9-29-34" fill="#d1ae77" opacity=".78"/><path d="M-24-16q20-20 34-1t-12 23q-23-5-22-22" fill="#ece0bb" opacity=".75"/></g>''')
    b.append('''<g transform="translate(789 515) rotate(17)" filter="url(#smallShadow)"><path d="M0 0h16v302H0z" fill="#0d1720"/><path d="M4 0h5v280H4z" fill="#62716f" opacity=".5"/><path d="M0 30h16m-16 220h16" stroke="#d9b978" stroke-width="7"/><path d="M0 301h16l-8 35z" fill="url(#gold)"/><path d="m5 323 3 13 3-13" fill="#17202a"/><rect x="-3" y="-12" width="22" height="20" rx="6" fill="url(#gold)"/><path d="M14 0q14 10 7 80" fill="none" stroke="#d9b978" stroke-width="4"/></g>''')
    b.append('<path d="M130 88q-15-27-32-11t-3 34l48 58q14 15 26 1t-1-27l-36-42" fill="none" stroke="url(#metal)" stroke-width="6" stroke-linecap="round"/>')
    write('ui/dossier.svg',900,1050,''.join(b),'A confidential detective dossier with a recovered cafe photograph, field notes, fingerprint, red string, espresso and pen')

def make_desk():
    b=['<rect width="1000" height="760" fill="url(#wood)"/><rect width="1000" height="760" fill="url(#grain)"/>']
    for y in [145,322,498,677]:
        b.append(f'<path d="M0 {y}Q300 {y-3} 640 {y+2}T1000 {y}" fill="none" stroke="#100f10" stroke-opacity=".8" stroke-width="5"/><path d="M0 {y+4}h1000" stroke="#aa8059" stroke-opacity=".18"/>')
    for x,y in [(150,98),(880,170),(510,460),(81,690),(946,564)]:
        b.append(f'<ellipse cx="{x}" cy="{y}" rx="32" ry="7" fill="none" stroke="#b98a5d" stroke-opacity=".1"/><ellipse cx="{x}" cy="{y}" rx="14" ry="3" fill="#151518" opacity=".4"/>')
    b += ['<ellipse cx="135" cy="0" rx="590" ry="640" fill="url(#light)"/>','<path d="M650 0h350v760H864z" fill="#0b121a" opacity=".17"/>']
    # Decorative lamp stays in the upper-left margin, outside all interactive items.
    b.append('''<g transform="translate(71 64)" filter="url(#smallShadow)"><path d="M-45-64h155l-12 85H-34z" fill="#15272b" stroke="#79786a" stroke-width="3"/><ellipse cx="33" cy="21" rx="66" ry="12" fill="#8d754b"/><ellipse cx="33" cy="20" rx="58" ry="8" fill="#ecd09a"/><path d="M-30-53h127M-25-38h116" stroke="#8aa09a" stroke-opacity=".2" stroke-width="3"/><path d="M25 35h16v81H25z" fill="url(#metal)"/><ellipse cx="33" cy="118" rx="46" ry="12" fill="#15272b" stroke="#7b7a68" stroke-width="2"/></g>''')
    # Fountain pen on the far right, clear of the cup/coaster hit areas.
    b.append('''<g transform="translate(932 375) rotate(14)" filter="url(#smallShadow)"><rect x="0" y="0" width="12" height="135" rx="5" fill="#14202a"/><path d="M3 4v118" stroke="#b1bbb0" stroke-opacity=".5" stroke-width="2"/><path d="M-1 20h14m-14 95h14" stroke="#c5a469" stroke-width="4"/><path d="m0 135 6 22 6-22" fill="url(#gold)"/><path d="M9 0q12 0 6 44" fill="none" stroke="#c5a469" stroke-width="3"/></g>''')
    b.append('''<g transform="translate(74 425) rotate(-20)" filter="url(#smallShadow)"><circle r="22" fill="none" stroke="url(#gold)" stroke-width="11"/><circle r="9" fill="#2a2420"/><path d="M17-5h81v12H83v14H72V8H59v11H48V7H17z" fill="url(#gold)"/><path d="M28-1h66" stroke="#f5dba6" stroke-opacity=".6" stroke-width="2"/></g>''')
    for p in [(520,80,1.0,20),(546,66,.8,-30),(570,91,.8,70),(894,73,.9,25),(916,92,.7,-35),(542,685,.7,60),(562,700,.8,-20)]:
        b.append(bean(*p))
    b.append('''<g opacity=".12" fill="none" stroke="#d4b484"><ellipse cx="647" cy="514" rx="46" ry="36" stroke-width="3"/><ellipse cx="650" cy="511" rx="48" ry="36"/><path d="M581 420q15-9 27-3m50 224 22 3M142 247l29 4" stroke-width="2"/></g><rect x="12" y="12" width="976" height="736" rx="2" fill="none" stroke="#d7b276" stroke-opacity=".12"/>''')
    write('cafe/desk.svg',1000,760,''.join(b),'An atmospheric wooden cafe tabletop with warm lamp light, decorative coffee beans, a pen and an old key; clear spaces for evidence')

def make_evidence():
    receipt='''<g transform="translate(110 39) rotate(6 140 225)" filter="url(#smallShadow)"><path d="M0 0l12 8L24 0l12 8L48 0l12 8L72 0l12 8L96 0l12 8L120 0l12 8L144 0l12 8L168 0l12 8L192 0l12 8L216 0l12 8L240 0l12 8L264 0l16 7v443l-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7-12-7-12 7V0z" fill="url(#paper)"/><path d="M0 0h280v450H0z" fill="url(#fiber)"/><path d="M11 219q129-14 256 4" fill="none" stroke="#b5a48a" stroke-opacity=".55" stroke-width="2"/><path d="M11 223q129-14 256 4" fill="none" stroke="#f5edda" stroke-opacity=".75" stroke-width="2"/>
    <text x="140" y="58" text-anchor="middle" font-family="Georgia,serif" font-size="27" letter-spacing="4" fill="#27323a">NOIR CAFÉ</text><text x="140" y="81" text-anchor="middle" font-family="monospace" font-size="10" letter-spacing="3" fill="#53605f">COFFEE · CONVERSATION</text><path d="M25 99h230m-230 4h230" stroke="#7d8174" stroke-width="1"/><text x="27" y="131" font-family="monospace" font-size="13" fill="#424b4c">ONE ESPRESSO</text><text x="27" y="158" font-family="monospace" font-size="13" fill="#424b4c">HOUSE BLEND</text><text x="27" y="185" font-family="monospace" font-size="13" fill="#424b4c">A QUIET TABLE</text><path d="M26 260h125m-125 15h189m-189 16h158m-158 16h184" stroke="#646b64" stroke-opacity=".55" stroke-width="3"/><text x="140" y="350" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="19" fill="#5e6258">There is always a trace.</text><path d="M44 387h192" stroke="#858477" stroke-dasharray="3 4"/><text x="140" y="418" text-anchor="middle" font-family="monospace" font-size="10" letter-spacing="2" fill="#60665f">KEEP YOUR RECEIPT</text></g>'''
    write('evidence/receipt.svg',500,540,receipt,'A naturally angled fictional Noir Cafe receipt on transparent background, without cipher values')
    cup='''<g transform="translate(245 242) rotate(-12)" filter="url(#smallShadow)"><ellipse cy="27" rx="198" ry="152" fill="#0b1117" opacity=".2"/><ellipse rx="191" ry="149" fill="url(#ceramic)"/><ellipse cy="2" rx="160" ry="119" fill="none" stroke="#b7ac96" stroke-width="2"/><ellipse cy="4" rx="138" ry="103" fill="#c6bba4"/><path d="M115-48c88-45 100 73 13 81" fill="none" stroke="#928d81" stroke-width="36"/><path d="M113-54c83-43 91 67 14 79" fill="none" stroke="#ede4ce" stroke-width="28"/><ellipse cy="-12" rx="135" ry="111" fill="#aca18c"/><ellipse cy="-23" rx="133" ry="108" fill="#f3ead6"/><ellipse cy="-25" rx="116" ry="92" fill="url(#coffee)"/><ellipse cy="-27" rx="108" ry="85" fill="none" stroke="#c5965d" stroke-width="7" opacity=".8"/><path d="M-65-37c17-59 78-60 107-18 25 37-14 62-40 85-38-20-86-31-67-67z" fill="#b88c58" opacity=".9"/><path d="M-46-37c11-34 53-41 72-15 18 26-6 46-25 59-25-11-61-23-47-44z" fill="#e7d1a4"/><path d="M-28-39c13-19 30-17 37-2 8 17-1 21-11 30-14-7-36-13-26-28z" fill="#c6a371"/><ellipse cx="-76" cy="-67" rx="21" ry="6" fill="#f5dfb7" opacity=".16"/><path d="M-115 78q85 45 178 18" fill="none" stroke="#fff4dd" stroke-opacity=".35" stroke-width="4"/></g>'''
    write('evidence/cup.svg',540,460,cup,'A cream ceramic espresso cup and saucer, with warm coffee and crema, on transparent background')
    napkin='''<g transform="translate(235 223) rotate(-11)" filter="url(#smallShadow)"><path d="M-183-144 163-153 193 128-147 154-184 132z" fill="#b1a58f"/><path d="M-183-151 163-153 180 130-167 145z" fill="url(#paper)"/><path d="M-183-151 8 3 163-153z" fill="#f6ecd8"/><path d="M-183-151 8 3-167 145z" fill="#dfd0b4"/><path d="M8 3 180 130-167 145z" fill="#e5d7be"/><path d="M-183-151 163-153 180 130-167 145z" fill="url(#fiber)"/><path d="m-169-138 329-1 6 259-318 12z" fill="none" stroke="#9a927e" stroke-opacity=".4" stroke-dasharray="1 5" stroke-width="2"/><path d="m-183-151 191 154 155-156M8 3l-175 142M8 3l172 127" fill="none" stroke="#b8a98e" stroke-opacity=".75" stroke-width="1.4"/><path d="M-178-147 8 6 159-147" fill="none" stroke="#fff9e7" stroke-opacity=".7" stroke-width="2"/><path d="M-143 90q29-14 55-7m-56 20q46-8 73-8" fill="none" stroke="#7c8479" stroke-opacity=".35" stroke-width="2"/></g>'''
    write('evidence/napkin.svg',500,420,napkin,'A softly folded paper cafe napkin with visible fibers and natural creases, on transparent background')
    coaster='''<g transform="translate(220 214) rotate(8)" filter="url(#smallShadow)"><circle cy="9" r="175" fill="#655139"/><circle r="175" fill="#c4ab7d"/><circle r="164" fill="#d8c293" stroke="#655a45" stroke-width="2"/><circle r="153" fill="#dfcdA6" stroke="#8a7958" stroke-width="1" stroke-dasharray="1 5"/><circle r="175" fill="url(#fiber)"/><circle r="125" fill="none" stroke="#3e514f" stroke-width="2"/><circle r="117" fill="none" stroke="#3e514f" stroke-opacity=".5"/><path d="M-43-30h72v44q0 24-36 24t-36-24z" fill="none" stroke="#3e514f" stroke-width="4"/><path d="M29-25q33-4 29 19T31 13M-58 47H52" fill="none" stroke="#3e514f" stroke-width="4" stroke-linecap="round"/><path d="M-21-43q-12-14 0-28m21 28q-12-14 0-28m21 28q-12-14 0-28" fill="none" stroke="#3e514f" stroke-width="3" opacity=".6"/><text y="-91" text-anchor="middle" font-family="Georgia,serif" font-size="18" letter-spacing="5" fill="#3e514f">NOIR CAFÉ</text><text y="89" text-anchor="middle" font-family="Georgia,serif" font-size="13" font-style="italic" fill="#3e514f">Stay a little longer.</text><path d="M-99 1h-13m211 0h13" stroke="#3e514f" stroke-width="2"/><circle cx="-106" cy="-10" r="2" fill="#3e514f"/><circle cx="106" cy="-10" r="2" fill="#3e514f"/></g>'''
    write('evidence/coaster.svg',440,440,coaster,'A textured round fictional cafe coaster with a simple cup motif, on transparent background')

def make_blueprint():
    b=['''<rect width="1200" height="600" fill="#142c3e"/><rect width="1200" height="600" fill="url(#bpGrid)"/><rect x="16" y="16" width="1168" height="568" fill="none" stroke="#a9c9c7" stroke-opacity=".3"/><g fill="none" stroke="#a7c8c6" stroke-linejoin="miter">''']
    # One uninterrupted building envelope spans all three puzzle thirds.
    b.append('''<path d="M40 248V91h1120v424H40V352" stroke-width="9"/><path d="M49 248V100h1102v406H49V352" stroke-width="1.2"/><path d="M40 248h100v104H40" stroke-width="3"/><path d="M40 248a104 104 0 0 1 104 104" stroke-width="1" stroke-dasharray="5 4"/><path d="M140 248H334m-194 104H334" stroke-width="2"/>
    <path d="M333 100v145m0 110v151M811 100v143m0 114v149" stroke-width="6"/><path d="M334 245h76M334 355h76M811 243h-58M811 357h-58" stroke-width="2"/><path d="M333 245a110 110 0 0 1 110 110M811 243a114 114 0 0 0-114 114" stroke-width="1" stroke-dasharray="4 5"/>
    <path d="M50 170h162V100m0 70v76M50 429h162v77m0-77v-76" stroke-width="3"/><path d="M68 119h126v31H68zm0 328h126v31H68z" stroke-width="1"/><path d="M87 119v31m27-31v31m27-31v31m27-31v31M87 447v31m27-31v31m27-31v31m27-31v31" stroke-width=".7"/>
    <rect x="379" y="127" width="389" height="352" stroke-width="2"/><rect x="392" y="140" width="363" height="326" stroke-width="1"/><path d="M573.5 140v326" stroke-width="1.7"/><circle cx="573.5" cy="303" r="53" stroke-width="1.7"/><circle cx="573.5" cy="303" r="5" stroke-width="1"/>
    <path d="M392 224h83v158h-83m363-158h-83v158h83M392 263h45v80h-45m363-80h-45v80h45" stroke-width="1.5"/><path d="M475 224a91 91 0 0 1 0 158M672 224a91 91 0 0 0 0 158" stroke-width="1.5"/><path d="M437 263a45 45 0 0 1 0 80M710 263a45 45 0 0 0 0 80" stroke-width="1" stroke-dasharray="4 4"/><path d="M392 174q174 129 0 258M755 174q-174 129 0 258" stroke-width="1.7"/><path d="M382 288v30m0-15h14m369-15v30m0-15h-14" stroke-width="3"/>
    <rect x="845" y="151" width="274" height="45" rx="1" stroke-width="2"/><rect x="858" y="161" width="71" height="24" stroke-width="1"/><rect x="944" y="161" width="55" height="24" stroke-width="1"/><rect x="1014" y="161" width="90" height="24" stroke-width="1"/>
    <path d="M844 226h273v249H844z" stroke-width="2"/>''')
    for y in range(239,471,29):
        b.append(f'<path d="M850 {y}h260m-260 11h260" stroke-width="1"/><path d="M876 {y}v11m32-11v11m32-11v11m32-11v11m32-11v11m32-11v11m32-11v11m32-11v11" stroke-width=".7"/>')
    b.append('''<path d="M986 226v249m15-249v249" stroke-width="2"/><path d="M986 239h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15m-15 18h15" stroke-width="1"/>
    <path d="M40 59h1120M40 51v16m293-16v16m478-16v16m349-16v16M20 91v424m-8-424h16m-16 424h16" stroke-width=".8"/><path d="M40 55v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8m20-8v8" stroke-width=".65"/><path d="M40 547h1120m-1120-9v18m293-18v18m478-18v18m349-18v18" stroke-width=".8"/>
    <path d="M105 198v35m-12-17 12-18 12 18M240 303h58m-12-12 12 12-12 12" stroke-width="1.5"/><path d="M1093 44v30m-8-17 8-13 8 13" stroke-width="1.5"/></g>
    <g fill="#b0ceca" font-family="monospace" letter-spacing="2"><text x="110" y="304" font-size="13" text-anchor="middle">ENTRY</text><text x="1066" y="43" font-size="11">N</text><text x="56" y="576" font-size="10" opacity=".65">RECOVERED ARCHITECTURAL PLAN</text><text x="1147" y="576" font-size="10" text-anchor="end" opacity=".65">FIELD COPY / DO NOT SCALE</text></g>''')
    defs='''<defs><pattern id="bpGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0v25" fill="none" stroke="#73a3ab" stroke-opacity=".17" stroke-width=".8"/></pattern></defs>'''
    write('blueprint/continuous.svg',1200,600,''.join(b),'One continuous architectural floor plan showing a connected entrance corridor, an indoor court, a scoreboard and spectator stands',defs)

def hall_body(w=1000,h=1000):
    b=['''<rect width="1000" height="1000" fill="#14202b"/><path d="M0 0h1000v380L720 534H280L0 380z" fill="#203744"/><path d="M0 1000V380l280 154v102L0 876zm1000 0V380L720 534v102l280 240z" fill="#1b2c37"/><path d="M280 371h440v265H280z" fill="#405459"/><path d="M303 389h394v231H303z" fill="#253d47"/><path d="M0 1000V860l280-236h440l280 236v140z" fill="url(#courtFloor)"/>
    <path d="M0 0h1000L720 371H280z" fill="#12232f"/>''']
    # Perspective roof trusses and beams.
    for y,left,right in [(30,20,980),(131,96,904),(224,164,836),(302,224,776),(356,267,733)]:
        b.append(f'<path d="M{left} {y}H{right}M{left} {y+10}H{right}" stroke="#637271" stroke-width="7"/><path d="M{left} {y}l{(right-left)/4} 10 {(right-left)/4}-{10} {(right-left)/4} 10 {(right-left)/4}-{10}" fill="none" stroke="#82918a" stroke-opacity=".55" stroke-width="3"/>')
    for x in [70,240,410,590,760,930]:
        bx=280+x*.44
        b.append(f'<path d="M{x} 0 {bx} 371" stroke="#81908a" stroke-opacity=".35" stroke-width="6"/>')
    for y,xl,xr in [(134,114,886),(242,193,807),(322,251,749)]:
        b.append(f'<path d="M{xl} {y}H{xr}" stroke="#0e1c27" stroke-width="15"/><path d="M{xl+14} {y+2}H{xr-14}" stroke="#ead8a3" stroke-width="4"/><ellipse cx="500" cy="{y+12}" rx="{(xr-xl)*.48}" ry="36" fill="url(#light)" opacity=".45"/>')
    # High windows and angled shafts of warm late afternoon light.
    for i in range(5):
        y=392+i*29; x=36+i*48
        b.append(f'<path d="M{x} {y}l34 17v62l-34-14z" fill="#c6b77b" stroke="#62716a" stroke-width="3"/>')
        x2=964-i*48
        b.append(f'<path d="M{x2} {y}l-34 17v62l34-14z" fill="#89a1a0" stroke="#607679" stroke-width="3"/>')
    b.append('''<path d="M33 407 309 541l467 459H392z" fill="#f5d590" opacity=".09"/><path d="M132 452 362 563l233 437H411z" fill="#f5d590" opacity=".08"/><path d="M225 499 407 588l64 412H379z" fill="#f5d590" opacity=".07"/>
    <path d="M285 540h430v93H285z" fill="#263b43"/><path d="M286 602h428" stroke="#70817b" stroke-width="3"/>
    <rect x="427" y="413" width="146" height="65" rx="3" fill="#0d1a23" stroke="#9b9f88" stroke-width="3"/><path d="M435 438h130" stroke="#546d68" stroke-width="1"/><text x="459" y="432" text-anchor="middle" fill="#c2c1a1" font-family="monospace" font-size="8" letter-spacing="1">HOME</text><text x="542" y="432" text-anchor="middle" fill="#c2c1a1" font-family="monospace" font-size="8" letter-spacing="1">GUEST</text><text x="460" y="463" text-anchor="middle" fill="#d9b978" font-family="monospace" font-size="25">00</text><text x="541" y="463" text-anchor="middle" fill="#d9b978" font-family="monospace" font-size="25">00</text><circle cx="500" cy="447" r="2" fill="#97aa99"/><circle cx="500" cy="455" r="2" fill="#97aa99"/>
    <path d="M463 535v-37h74v37" fill="#a2b1a9" fill-opacity=".15" stroke="#b9c2b3" stroke-width="2"/><path d="M489 521h22v12h-22z" fill="none" stroke="#e0d8b7"/><ellipse cx="500" cy="536" rx="16" ry="4" fill="none" stroke="#be7754" stroke-width="3"/><path d="m485 538 6 24h18l6-24m-26 9h22m-19 9h16m-12-17 4 23 4-23" fill="none" stroke="#d6d0b5" stroke-opacity=".7" stroke-width=".8"/>
    <path d="M294 624 47 919H953L706 624z" fill="none" stroke="#eadcb5" stroke-width="3"/><path d="M500 624v295" stroke="#eadcb5" stroke-width="2.5"/><ellipse cx="500" cy="761" rx="101" ry="47" fill="none" stroke="#eadcb5" stroke-width="2.5"/><path d="M380 624 336 689h328l-44-65M239 691q261 292 522 0M156 833H844M195 785h610" fill="none" stroke="#e6d6ab" stroke-opacity=".85" stroke-width="2"/><path d="M414 624 385 664h230l-29-40" fill="#4c6d70" stroke="#eadcb5" stroke-width="2"/><ellipse cx="500" cy="667" rx="115" ry="28" fill="none" stroke="#e6d6ab" stroke-width="2"/>
    ''')
    # Bleachers on each side, diminishing toward the back wall.
    for i in range(6):
        y=672+i*35; xl=236-i*31; xr=764+i*31
        b.append(f'<path d="M0 {y+35} {xl} {y-27}v18L0 {y+59}z" fill="{["#32464c","#3f5659"][i%2]}" stroke="#748076" stroke-opacity=".45"/><path d="M1000 {y+35} {xr} {y-27}v18l{1000-xr} {68}z" fill="{["#32464c","#3f5659"][i%2]}" stroke="#748076" stroke-opacity=".45"/>')
        for j in range(6):
            x=xl*(j+.5)/6
            yy=y+35-(y+35-(y-27))*(j+.5)/6
            b.append(f'<path d="M{x:.1f} {yy:.1f}v9m{1000-x*2:.1f}-9v9" stroke="#0c1b25" stroke-opacity=".6" stroke-width="3"/>')
    for i in range(22):
        topx=310+i*18
        bottomx=(topx-500)*2.5+500
        b.append(f'<path d="M{topx} 624 {bottomx} 1000" stroke="#6c4f35" stroke-opacity=".15" stroke-width=".8"/>')
    b.append('''<path d="M0 925q500 42 1000 0v75H0z" fill="#07131d" opacity=".22"/><ellipse cx="453" cy="772" rx="440" ry="311" fill="url(#light)" opacity=".35"/><path d="M0 0h1000v1000H0z" fill="url(#fiber)" opacity=".3"/>''')
    return ''.join(b)

HALL_DEFS='''<defs><linearGradient id="courtFloor" x2=".6" y2="1"><stop stop-color="#84704d"/><stop offset=".45" stop-color="#b09461"/><stop offset="1" stop-color="#70553c"/></linearGradient></defs>'''

def make_hall():
    write('completion/sports-hall.svg',1000,1000,hall_body(),'A cinematic empty indoor sports hall, with a marked court, hoops, scoreboard, spectator stands and golden light',HALL_DEFS)

def door_frame(body):
    return '''<rect width="400" height="500" fill="#12202c"/><path d="M18 500V111Q18 18 200 18T382 111v389" fill="#273b42"/><path d="M36 500V117Q36 40 200 40t164 77v383" fill="#0b1722"/>'''+body+'''<path d="M18 500V111Q18 18 200 18T382 111v389M36 500V117Q36 40 200 40t164 77v383" fill="none" stroke="#bca474" stroke-width="3"/><path d="M24 500V112Q24 25 200 25t176 87v388" fill="none" stroke="#6f765f" stroke-width="1"/><path d="M17 487h366" stroke="#d9b978" stroke-opacity=".5" stroke-width="3"/>'''

def make_doors():
    library=['''<path d="M37 115Q37 40 200 40t163 75v370H37z" fill="#172b34"/><path d="M37 500V169l100 105v105L37 475zm326 0V169L263 274v105l100 96z" fill="#4c4738"/><path d="M137 186h126v193H137z" fill="#43594f"/><path d="M163 207q37-58 74 0v136h-74z" fill="#8da18b"/><path d="M171 211q29-44 58 0v124h-58z" fill="#bdc39c"/><path d="M200 178v170m-31-81h62" stroke="#304b48" stroke-width="5"/><path d="M38 475 137 379h126l99 96v25H38z" fill="#8c7756"/>''']
    for side in range(2):
        for row in range(5):
            y=188+row*46
            for i in range(8):
                x=44+i*10 if not side else 278+i*10
                library.append(f'<path d="M{x} {y+i*.7}v30h7v-30z" fill="{["#b19969","#68766a","#916f4f","#344e54"][i%4]}" stroke="#d3ba83" stroke-opacity=".3"/>')
            library.append(f'<path d="M38 {y+37}h88m148 0h88" stroke="#b99b6a" stroke-width="5"/>')
    library.append('''<path d="M140 394h122l18 38H121z" fill="#705339" stroke="#b4996e" stroke-width="2"/><path d="M141 433v52m116-52v52" stroke="#382d25" stroke-width="8"/><path d="M164 402q19-10 37 0 19-10 37 0v15q-19-10-37 0-19-10-37 0z" fill="#dfd0ac"/><path d="M201 402v15" stroke="#8b8067"/><ellipse cx="200" cy="288" rx="120" ry="170" fill="url(#light)" opacity=".3"/>''')
    write('completion/door-library.svg',400,500,door_frame(''.join(library)),'An arched view into a quiet library with filled bookshelves, a reading table and warm window light')
    gym='''<path d="M37 115Q37 40 200 40t163 75v370H37z" fill="#1d3540"/><path d="M37 185h326v180H37z" fill="#4b6266"/><path d="M51 201h298v137H51z" fill="url(#glass)"/><path d="M150 201v137m100-137v137" stroke="#81938d" stroke-width="3"/><path d="M37 500V366h326v134" fill="#36474b"/><path d="M37 414h326M37 463h326M99 366 67 500m106-134-11 134m65-134 11 134m65-134 32 134" stroke="#91a299" stroke-opacity=".2"/><path d="M55 175h290" stroke="#d8d2ae" stroke-width="6"/><path d="M75 430h94l-9 12H66z" fill="#17242d" stroke="#9ba69a" stroke-width="2"/><path d="m91 430 5-79 46-36h16m-61 37h41m-2-37v-52m-14 0h30" fill="none" stroke="#7b8f8f" stroke-width="8"/><rect x="111" y="262" width="46" height="31" rx="3" fill="#12232e"/><path d="M80 448v27m74-27v27" stroke="#7b8f8f" stroke-width="8"/><path d="M232 346h88v97h-88z" fill="none" stroke="#869993" stroke-width="6"/><path d="M225 366h102" stroke="#19252d" stroke-width="9"/><path d="M224 351v30m14-34v38m77-34v30m-14-34v38" stroke="#adb4a4" stroke-width="10"/><path d="M241 420h62l10 20h-82z" fill="#17242d" stroke="#a2ab9b" stroke-width="2"/><path d="M243 441v36m60-36v36" stroke="#869993" stroke-width="6"/><circle cx="196" cy="441" r="21" fill="#b09a66" stroke="#d7c18d" stroke-width="2"/><path d="M196 420v42m-21-21h42" stroke="#8f7851"/><path d="M37 100h326v400H37z" fill="url(#fiber)" opacity=".25"/>'''
    write('completion/door-gym.svg',400,500,door_frame(gym),'An arched view into a fitness gym with a treadmill, weight rack, exercise ball and mirrored wall')
    field='''<path d="M37 115Q37 40 200 40t163 75v370H37z" fill="#5b7781"/><path d="M37 139q76-18 144 6t182-8v75H37z" fill="#c3c2a0" opacity=".55"/><circle cx="280" cy="133" r="35" fill="#ead5a1"/><path d="M37 234q76-29 147-6t179-4v88H37z" fill="#354e4a"/><path d="M37 264h326v236H37z" fill="#537464"/><path d="M37 291h326M37 326h326M37 370h326M37 423h326" stroke="#78916e" stroke-width="15" opacity=".4"/><path d="M58 483 135 293h130l77 190z" fill="none" stroke="#d1d3af" stroke-width="3"/><path d="M97 388h206" stroke="#d1d3af" stroke-width="3"/><ellipse cx="200" cy="388" rx="42" ry="24" fill="none" stroke="#d1d3af" stroke-width="2"/><path d="M154 294v41h92v-41m-69 0v22h46v-22" fill="none" stroke="#d1d3af" stroke-width="2"/><path d="M162 294v-42h76v42" fill="none" stroke="#d7d8bc" stroke-width="4"/><path d="M170 254v38m10-38v38m10-38v38m10-38v38m10-38v38m10-38v38m10-38v38M163 263h74m-74 10h74m-74 10h74" stroke="#aebba3" stroke-width=".8"/><path d="M61 290V153m-12 0h24m-22-7h20m-19 13h18M340 290V153m-12 0h24m-22-7h20m-19 13h18" stroke="#abb7a4" stroke-width="3"/><path d="M38 315h51m223 0h51" stroke="#c1bb91" stroke-width="5"/><path d="M37 100h326v400H37z" fill="url(#fiber)" opacity=".25"/>'''
    write('completion/door-field.svg',400,500,door_frame(field),'An arched view of an outdoor sports field under open sky, with grass, goalposts and floodlights')
    # The fourth option is visually consistent with the complete destination art.
    hall='<g transform="translate(37 100) scale(.326 .4)">'+hall_body()+'</g>'
    write('completion/door-hall.svg',400,500,door_frame(hall),'An arched view into an indoor team sports hall with a marked court, hoop and spectator stands',HALL_DEFS)

if __name__ == '__main__':
    make_mark()
    make_dossier()
    make_desk()
    make_evidence()
    make_blueprint()
    make_hall()
    make_doors()
    print('Generated 13 original SVG illustrations.')
