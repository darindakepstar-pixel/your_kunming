// SVG-заглушки для мест без фотографий
const B='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 930" preserveAspectRatio="xMidYMid slice">';
const E='</svg>';
const blur='<filter id="b"><feGaussianBlur stdDeviation="26"/></filter><filter id="b2"><feGaussianBlur stdDeviation="9"/></filter>';
const scenes={
  market:B+blur+`<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#231433"/><stop offset=".55" stop-color="#3A1E3E"/><stop offset="1" stop-color="#160D20"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g1)"/>
    <g filter="url(#b)"><circle cx="90" cy="300" r="90" fill="#E3557B" opacity=".55"/>
    <circle cx="330" cy="240" r="110" fill="#8C4FD1" opacity=".5"/>
    <circle cx="220" cy="470" r="80" fill="#F2A34B" opacity=".45"/>
    <circle cx="360" cy="560" r="70" fill="#E3557B" opacity=".4"/></g>
    <g filter="url(#b2)"><circle cx="110" cy="620" r="34" fill="#F26B8A"/><circle cx="185" cy="655" r="27" fill="#F2A34B"/>
    <circle cx="255" cy="628" r="31" fill="#C75BD1"/><circle cx="325" cy="660" r="24" fill="#F26B8A"/></g>
    <rect y="700" width="430" height="230" fill="#120A1B" opacity=".8"/>`+E,
  lake:B+blur+`<defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8FCDD9"/><stop offset=".45" stop-color="#4E9AA6"/><stop offset="1" stop-color="#14343B"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g2)"/>
    <circle cx="330" cy="180" r="46" fill="#FBEFD4" opacity=".92"/>
    <g filter="url(#b)"><circle cx="100" cy="420" r="100" fill="#B7E3DC" opacity=".5"/><circle cx="340" cy="520" r="90" fill="#2E6E77" opacity=".6"/></g>
    <path d="M0 560 Q120 520 220 552 T430 545 V930 H0 Z" fill="#1E4A50"/>
    <path d="M0 640 Q150 600 280 636 T430 630 V930 H0 Z" fill="#123238"/>
    <g fill="#FBFDF9"><path d="M120 300 q12 -12 24 0 q-12 -5 -24 0"/><path d="M200 250 q12 -12 24 0 q-12 -5 -24 0"/>
    <path d="M280 320 q11 -11 22 0 q-11 -5 -22 0"/><path d="M160 380 q10 -10 20 0 q-10 -4 -20 0"/></g>`+E,
  cafe:B+blur+`<defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2A1D14"/><stop offset="1" stop-color="#120B07"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g3)"/>
    <g filter="url(#b)"><circle cx="120" cy="260" r="80" fill="#E89B4B" opacity=".5"/><circle cx="330" cy="380" r="95" fill="#B45E2C" opacity=".45"/>
    <circle cx="200" cy="560" r="75" fill="#E8C07A" opacity=".35"/></g>
    <g filter="url(#b2)"><circle cx="90" cy="180" r="13" fill="#F2C879" opacity=".9"/><circle cx="160" cy="140" r="9" fill="#F2C879" opacity=".7"/>
    <circle cx="300" cy="170" r="11" fill="#F2C879" opacity=".8"/><circle cx="360" cy="240" r="8" fill="#F2C879" opacity=".6"/></g>
    <ellipse cx="215" cy="700" rx="140" ry="26" fill="#000" opacity=".4"/>
    <circle cx="215" cy="640" r="62" fill="#C0672F"/><ellipse cx="215" cy="640" rx="42" ry="38" fill="#3A1F0F"/>
    <path d="M245 560 q14 -22 2 -40 M215 552 q14 -22 2 -40" stroke="#F4E8D2" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>`+E,
  temple:B+blur+`<defs><linearGradient id="g4" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#F0A85C"/><stop offset=".5" stop-color="#C65B41"/><stop offset="1" stop-color="#3A1414"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g4)"/>
    <circle cx="215" cy="270" r="66" fill="#FBE9C9" opacity=".9"/>
    <g filter="url(#b)"><circle cx="80" cy="200" r="70" fill="#F5C97E" opacity=".5"/><circle cx="360" cy="330" r="80" fill="#8C2E1E" opacity=".5"/></g>
    <path d="M60 560 L215 470 L370 560 Z" fill="#4A160F"/>
    <path d="M30 566 L215 452 L400 566" stroke="#2A0C08" stroke-width="12" fill="none" stroke-linecap="round"/>
    <rect x="120" y="560" width="190" height="120" fill="#33110B"/>
    <rect x="188" y="596" width="54" height="84" fill="#1A0805"/>
    <rect y="680" width="430" height="250" fill="#1F0B07"/>
    <circle cx="140" cy="620" r="10" fill="#F2B65C"/><circle cx="290" cy="620" r="10" fill="#F2B65C"/>`+E,
  hills:B+blur+`<defs><linearGradient id="g5" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#CBE4D6"/><stop offset=".5" stop-color="#6FA893"/><stop offset="1" stop-color="#1C3A31"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g5)"/>
    <g filter="url(#b)"><circle cx="330" cy="180" r="80" fill="#FBFDF9" opacity=".55"/><circle cx="90" cy="320" r="90" fill="#8FC2AC" opacity=".5"/></g>
    <path d="M-20 480 L120 300 L260 480 Z" fill="#4C7D6B" opacity=".85"/>
    <path d="M120 540 L280 320 L440 540 Z" fill="#35604F"/>
    <path d="M-20 620 L100 480 L240 620 Z" fill="#274A3D"/>
    <path d="M180 660 L320 500 L460 660 Z" fill="#1D3A30"/>
    <rect y="640" width="430" height="290" fill="#152B23"/>
    <g filter="url(#b)"><ellipse cx="215" cy="560" rx="180" ry="34" fill="#DFF0E6" opacity=".35"/></g>`+E,
  night:B+blur+`<defs><linearGradient id="g6" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0D1024"/><stop offset="1" stop-color="#05070F"/></linearGradient></defs>
    <rect width="430" height="930" fill="url(#g6)"/>
    <g fill="#F4F6F3"><circle cx="50" cy="90" r="1.8"/><circle cx="150" cy="60" r="1.5"/><circle cx="260" cy="100" r="2"/><circle cx="370" cy="70" r="1.6"/></g>
    <g filter="url(#b)"><circle cx="120" cy="430" r="85" fill="#3D62D9" opacity=".5"/><circle cx="320" cy="360" r="80" fill="#D93DA1" opacity=".45"/>
    <circle cx="230" cy="560" r="75" fill="#2FA07A" opacity=".4"/></g>
    <rect x="40" y="380" width="70" height="300" fill="#0E1430"/><rect x="130" y="320" width="84" height="360" fill="#131A3D"/>
    <rect x="236" y="410" width="64" height="270" fill="#0E1430"/><rect x="318" y="300" width="82" height="380" fill="#131A3D"/>
    <g fill="#F2C879" opacity=".95"><rect x="146" y="340" width="10" height="10"/><rect x="172" y="380" width="10" height="10"/>
    <rect x="334" y="330" width="10" height="10"/><rect x="360" y="376" width="10" height="10"/><rect x="334" y="430" width="10" height="10"/></g>
    <g fill="#F26B8A"><rect x="56" y="410" width="10" height="10"/><rect x="252" y="440" width="10" height="10"/></g>
    <rect y="680" width="430" height="250" fill="#04060C"/>`+E
};
