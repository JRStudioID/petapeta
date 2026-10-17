/**
 * Helper to dynamically load the self-hosted html2pdf.bundle.min.js script
 */
export async function loadHtml2Pdf(): Promise<any> {
  if (typeof window !== "undefined" && (window as any).html2pdf) {
    return (window as any).html2pdf;
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="/html2pdf.bundle.min.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).html2pdf));
      existing.addEventListener("error", () => reject(new Error("Gagal memuat html2pdf")));
      return;
    }
    const script = document.createElement("script");
    script.src = "/html2pdf.bundle.min.js";
    script.async = true;
    script.onload = () => resolve((window as any).html2pdf);
    script.onerror = () => reject(new Error("Gagal memuat html2pdf"));
    document.body.appendChild(script);
  });
}
