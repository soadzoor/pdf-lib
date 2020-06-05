// import PDFDict from 'src/core/objects/PDFDict';
import PDFString from 'src/core/objects/PDFString';
import PDFHexString from 'src/core/objects/PDFHexString';
import PDFArray from 'src/core/objects/PDFArray';
import PDFName from 'src/core/objects/PDFName';

import PDFAcroTerminal from 'src/core/acroform/PDFAcroTerminal';
import PDFRef from '../objects/PDFRef';

class PDFAcroButton extends PDFAcroTerminal {
  // static fromDict = (dict: PDFDict) => new PDFAcroButton(dict);

  Opt(): PDFString | PDFHexString | PDFArray | undefined {
    return this.dict.lookupMaybe(
      PDFName.of('Opt'),
      PDFString,
      PDFHexString,
      PDFArray,
    );
  }

  getExportValues(): (PDFString | PDFHexString)[] | undefined {
    const opt = this.Opt();

    if (!opt) return undefined;

    if (opt instanceof PDFString || opt instanceof PDFHexString) {
      return [opt];
    }

    const values: (PDFString | PDFHexString)[] = [];
    for (let idx = 0, len = opt.size(); idx < len; idx++) {
      const value = opt.lookup(idx);
      if (value instanceof PDFString || value instanceof PDFHexString) {
        values.push(value);
      }
    }

    return values;
  }

  // Enforce use use of /Opt even if it isn't strictly necessary
  normalizeExportValues() {
    const exportValues = this.getExportValues() ?? [];

    const Opt = this.dict.context.obj([]);

    const widgets = this.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const exportVal =
        exportValues[idx] ??
        PDFHexString.fromText(widget.getOnValue()?.decodeText() ?? '');
      Opt.push(exportVal);
    }

    this.dict.set(PDFName.of('Opt'), Opt);
  }

  addWidgetWithOpt(widget: PDFRef, opt: PDFHexString | PDFString) {
    this.normalizeExportValues();
    const Opt = this.Opt() as PDFArray;
    this.addWidget(widget);
    Opt.push(opt);
    const apStateValue = PDFName.of(String(Opt.size() - 1));
    return apStateValue;
  }
}

export default PDFAcroButton;