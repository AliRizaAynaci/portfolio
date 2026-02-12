export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <span>© {new Date().getFullYear()} Ali Rıza Aynacı</span>
                <div className="footer__links">
                    <a
                        href="https://github.com/AliRizaAynaci"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://linkedin.com/in/alirizaaynaci"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LinkedIn
                    </a>
                    <a
                        href="https://medium.com/@aynacialiriza"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Medium
                    </a>
                    <a
                        href="https://www.youtube.com/@aynacialiriza"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        YouTube
                    </a>
                </div>
            </div>
        </footer>
    );
}
