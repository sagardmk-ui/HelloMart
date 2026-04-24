import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

function BarcodeScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "barcode-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (text) => {
        onScan(text);
        scanner.clear();
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return <div id="barcode-reader" />;
}

export default BarcodeScanner;