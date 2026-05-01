export default function Footer() {
    return (
        <footer className="eq-footer">
            <div className="eq-footer__inner">
                <div>
                    <div className="eq-footer__brand">The Aynacı Quarterly</div>
                    <div className="eq-footer__brand-meta">Est. 2024 · Kayseri</div>
                </div>

                <div className="eq-footer__col">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <span>Email</span>
                        <a href="mailto:aynacialiriza@gmail.com">aynacialiriza@gmail.com</a>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <span>GitHub</span>
                        <a href="https://github.com/AliRizaAynaci" target="_blank" rel="noopener noreferrer">@AliRizaAynaci</a>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <span>Medium</span>
                        <a href="https://medium.com/@aynacialiriza" target="_blank" rel="noopener noreferrer">@aynacialiriza</a>
                    </div>
                </div>

                <div className="eq-footer__notice">
                    Typeset in Source Serif & JetBrains Mono ·<br />
                    All opinions the writer&apos;s own ·<br />
                    © {new Date().getFullYear()} Ali Rıza Aynacı
                </div>
            </div>
        </footer>
    );
}
