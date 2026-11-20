<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\NamedRange;
use PhpOffice\PhpSpreadsheet\Style\Conditional;

class ExportController extends Controller
{
    public function exportTemplateJadwal()
    {
        $spreadsheet = new Spreadsheet();

        // =========================================================
        // 📌 SHEET 1: TEMPLATE JADWAL & PETUNJUK (BERDAMPINGAN)
        // =========================================================
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Template Jadwal');
        $sheet1->setShowGridlines(true);

        $thinBorder = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => 'D9D9D9'],
                ],
            ],
            'font' => ['name' => 'Arial', 'size' => 10],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
        ];

        // Header Tabel Utama (A1:F1)
        $headers = ['Tanggal', 'Posisi', 'Nama Paramedic', 'Peran', 'Tipe Jaga', 'Keterangan'];
        $sheet1->fromArray($headers, NULL, 'A1');

        $inputHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Arial', 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F4E78']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet1->getStyle('A1:F1')->applyFromArray($inputHeaderStyle);
        $sheet1->getRowDimension('1')->setRowHeight(28);

        // Tambahkan contoh tanggal di sel A2 dengan format Indonesia
        $today = now(); // Carbon instance, atau gunakan date('d/m/Y')
        $tomorrow = $today->copy()->addDay();
        $sheet1->setCellValue('A2', $today->format('d/m/Y'));

        $rangeExample = $today->format('d/m') . '-' . $tomorrow->format('d/m/Y');
        $sheet1->setCellValue('A3', $rangeExample);
        // Pastikan sel A2 juga menggunakan format tanggal yang sama
        $sheet1->getStyle('A2')
            ->getNumberFormat()
            ->setFormatCode('dd/mm/yyyy');

        // Gridlines untuk 100 baris input
        $sheet1->getStyle('A2:F10000')->applyFromArray($thinBorder);
        $sheet1->getStyle('A2:A10000')
            ->getNumberFormat()
            ->setFormatCode('dd/mm/yyyy');
        $sheet1->getStyle('A2:F10000')->getAlignment()->setWrapText(true);

        // ---------------------------------------------------------
        // 🎨 AREA PETUNJUK OPERASIONAL (SISI KANAN - KOLOM H)
        // ---------------------------------------------------------
        $sheet1->getColumnDimension('G')->setWidth(5);

        $subSectionStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Arial', 'size' => 10],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2F5597']],
            'alignment' => ['vertical' => Alignment::VERTICAL_CENTER, 'horizontal' => Alignment::HORIZONTAL_LEFT],
        ];

        $petunjukData = [
            ['No', 'Kolom', 'Ketentuan', 'Contoh'],
            ['1', 'Tanggal', 'Format: DD-MM-YYYY atau DD/MM/YYYY (tanpa tahun → otomatis tahun ini)', '22-04-2026'],
            ['2', 'Posisi', 'Otomatis terisi / pilih dari dropdown', 'Penyakit Dalam'],
            ['3', 'Paramedic', 'Pilih dari dropdown', 'Dr. Budi, Sp.PD'],
            ['4', 'Peran', 'Pilih dari dropdown', 'Utama'],
            ['5', 'Tipe Jaga', 'Pilih dari dropdown', 'Oncall'],
            ['6', 'Keterangan', 'Catatan tambahan', 'Libur'],
        ];

        $sheet1->fromArray($petunjukData, null, 'H1');

        $sheet1->getStyle('H1:K1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4F81BD']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ]);

        // Petunjuk tambahan format tanggal (sama seperti sebelumnya, tidak diubah)
        $additionalInstructions = [
            ['', '', 'FORMAT TANGGAL TUNGGAL:', ''],
            ['1a', 'Tanggal', 'DD-MM-YYYY', '22-04-2026'],
            ['', '', 'DD/MM/YYYY', '22/04/2026'],
            ['', '', 'DD-MM (tanpa tahun)', '22-04 (tahun otomatis ' . date('Y') . ')'],
            ['', '', 'DD/MM (tanpa tahun)', '22/04 (tahun otomatis ' . date('Y') . ')'],
            ['', '', 'RENTANG TANGGAL (pisahkan dengan "-"):', ''],
            ['', '', 'DD/MM-DD/MM/YYYY', '22/04-24/04/2026'],
            ['', '', 'DD/MM-DD/MM YYYY', '22/04-24/04 2026'],
            ['', '', 'DD/MM-DD/MM (tanpa tahun)', '22/04-24/04 (tahun otomatis ' . date('Y') . ')'],
            ['', '', 'CATATAN:', ''],
            ['', '', '• Gunakan pemisah "-" atau "/" untuk komponen tanggal.', ''],
            ['', '', '• Untuk rentang, pisahkan dua tanggal dengan "-" (mis. 22/04-24/04).', ''],
            ['', '', '• Tahun jika tidak ditulis akan menggunakan tahun sistem (' . date('Y') . ').', ''],
        ];

        $startRow = count($petunjukData) + 1;
        foreach ($additionalInstructions as $idx => $rowData) {
            $currentRow = $startRow + $idx;
            $sheet1->setCellValue("H{$currentRow}", $rowData[0]);
            $sheet1->setCellValue("I{$currentRow}", $rowData[1]);
            $sheet1->setCellValue("J{$currentRow}", $rowData[2]);
            $sheet1->setCellValue("K{$currentRow}", $rowData[3]);
        }

        $lastPetunjukRow = $startRow + count($additionalInstructions) - 1;
        $sheet1->getStyle("H1:K{$lastPetunjukRow}")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
        ]);

        // =========================================================
        // 📌 SHEET 2: MASTER DATA PARAMEDIC (pasangan paramedic - posisi)
        // =========================================================
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Master Paramedic');
        $sheet2->setCellValue('A1', 'Nama Paramedic');
        $sheet2->setCellValue('B1', 'posisi');

        $masterHeaderStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Arial'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '595959']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ];
        $sheet2->getStyle('A1:B1')->applyFromArray($masterHeaderStyle);
        $sheet2->getRowDimension('1')->setRowHeight(25);

        // Ambil data terurut: posisi dulu, lalu paramedic (agar formula OFFSET akurat)
        $paramedics = DB::table('bagian_paramedic')
            ->join('paramedic', 'bagian_paramedic.id_paramedic', '=', 'paramedic.id_paramedic')
            ->join('posisi', 'bagian_paramedic.id_posisi', '=', 'posisi.id_posisi')
            ->where('bagian_paramedic.is_deleted', 0)
            ->where('paramedic.is_deleted', 0)
            ->where('posisi.is_deleted', 0)
            ->select('paramedic.nama_paramedic', 'posisi.nama_posisi')
            ->orderBy('posisi.nama_posisi', 'asc')
            ->orderBy('paramedic.nama_paramedic', 'asc')
            ->get();

        $rowIdx = 2;
        foreach ($paramedics as $p) {
            $sheet2->setCellValue("A{$rowIdx}", $p->nama_paramedic);
            $sheet2->setCellValue("B{$rowIdx}", $p->nama_posisi);
            $sheet2->getStyle("A{$rowIdx}:B{$rowIdx}")->applyFromArray($thinBorder);
            $rowIdx++;
        }
        $totalParamedic = $rowIdx - 1; // baris terakhir data

        // =========================================================
        // 📌 SHEET 3: MASTER DATA posisi MURNI
        // =========================================================
        $sheet3 = $spreadsheet->createSheet();
        $sheet3->setTitle('Master posisi');
        $sheet3->setCellValue('A1', 'Nama posisi');
        $sheet3->getStyle('A1')->applyFromArray($masterHeaderStyle);
        $sheet3->getRowDimension('1')->setRowHeight(25);

        $specialties = DB::table('posisi')
            ->where('is_deleted', 0)
            ->orderBy('nama_posisi', 'asc')
            ->pluck('nama_posisi');

        $rowIdx = 2;
        foreach ($specialties as $namaposisi) {
            $sheet3->setCellValue("A{$rowIdx}", $namaposisi);
            $sheet3->getStyle("A{$rowIdx}")->applyFromArray($thinBorder);
            $rowIdx++;
        }
        $totalposisi = $rowIdx - 1;

        // =========================================================
        // 📌 NAMED RANGE DINAMIS UNTUK DROPDOWN posisi (KOLOM B)
        // =========================================================
        // Menggunakan $spreadsheet->addNamedRange(), bukan $sheet1->
        $spreadsheet->addNamedRange(
            new NamedRange(
                'posisiByParamedic',
                $sheet1,
                '=IF($C2="", \'Master posisi\'!$A$2:$A$' . $totalposisi
                . ', OFFSET(\'Master Paramedic\'!$B$1, MATCH($C2, \'Master Paramedic\'!$A$2:$A$' . $totalParamedic . ', 0), 0, COUNTIF(\'Master Paramedic\'!$A$2:$A$' . $totalParamedic . ', $C2), 1))'
            )
        );

        // =========================================================
        // 📌 FORMULA AUTO-FILL posisi (KOLOM B)
        // =========================================================
        for ($i = 2; $i <= 10000; $i++) {
            $sheet1->setCellValue(
                "B{$i}",
                "=IF(C{$i}=\"\", \"\", INDEX('Master Paramedic'!B:B, MATCH(C{$i}, 'Master Paramedic'!A:A, 0)))"
            );
        }

        // =========================================================
        // 📌 DATA VALIDATION
        // =========================================================
        // 1. Dropdown posisi (Kolom B) → gunakan named range posisiByParamedic
        $dvposisi = new DataValidation();
        $dvposisi->setType(DataValidation::TYPE_LIST);
        $dvposisi->setAllowBlank(true);
        $dvposisi->setShowDropDown(true);
        $dvposisi->setShowErrorMessage(false);
        $dvposisi->setFormula1('posisiByParamedic');
        $sheet1->setDataValidation('B2:B10000', $dvposisi);

        // 2. Dropdown Paramedic Terfilter Dinamis (Kolom C)
        for ($i = 2; $i <= 10000; $i++) {
            $dvParamedic = new DataValidation();
            $dvParamedic->setType(DataValidation::TYPE_LIST);
            $dvParamedic->setAllowBlank(true);
            $dvParamedic->setShowDropDown(true);
            $dvParamedic->setShowErrorMessage(false);
            $dvParamedic->setFormula1(
                "=IF(B{$i}=\"\",\"'Master Paramedic'!\$A\$2:\$A\${$totalParamedic}\","
                . "OFFSET('Master Paramedic'!\$A\$1,MATCH(B{$i},'Master Paramedic'!\$B\$2:\$B\${$totalParamedic},0),0,"
                . "COUNTIF('Master Paramedic'!\$B\$2:\$B\${$totalParamedic},B{$i}),1))"
            );
            $sheet1->setDataValidation('C' . $i, $dvParamedic);
        }

        // 3. Dropdown Peran & Tipe Jaga (tetap)
        $dvPeran = new DataValidation();
        $dvPeran->setType(DataValidation::TYPE_LIST);
        $dvPeran->setShowDropDown(true);
        $dvPeran->setFormula1('"Utama,Backup 1,Backup 2,Backup 3, - "');
        $sheet1->setDataValidation('D2:D10000', $dvPeran);

        $dvTipe = clone $dvPeran;
        $dvTipe->setFormula1('"Oncall,Onsite Pagi,Onsite Malam, - "');
        $sheet1->setDataValidation('E2:E10000', $dvTipe);

        // =========================================================
        // 📌 CONDITIONAL FORMATTING (VALIDASI PASANGAN posisi-PARAMEDIC)
        // =========================================================
        $conditionalStyles = [];

        $correctStyle = new Conditional();
        $correctStyle->setConditionType(Conditional::CONDITION_EXPRESSION);
        $correctStyle->addCondition(
            "=AND(\$B2<>\"\",\$C2<>\"\",COUNTIFS('Master Paramedic'!\$A\$2:\$A\${$totalParamedic},\$C2,'Master Paramedic'!\$B\$2:\$B\${$totalParamedic},\$B2)>0)"
        );
        $correctStyle->getStyle()->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E2EFDA');
        $correctStyle->getStyle()->getFont()->getColor()->setRGB('375623');
        $conditionalStyles[] = $correctStyle;

        $wrongStyle = new Conditional();
        $wrongStyle->setConditionType(Conditional::CONDITION_EXPRESSION);
        $wrongStyle->addCondition(
            "=AND(\$B2<>\"\",\$C2<>\"\",COUNTIFS('Master Paramedic'!\$A\$2:\$A\${$totalParamedic},\$C2,'Master Paramedic'!\$B\$2:\$B\${$totalParamedic},\$B2)=0)"
        );
        $wrongStyle->getStyle()->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('FCE4D6');
        $wrongStyle->getStyle()->getFont()->getColor()->setRGB('C65911');
        $wrongStyle->getStyle()->getFont()->setBold(true);
        $conditionalStyles[] = $wrongStyle;

        $sheet1->setConditionalStyles('B2:C10000', $conditionalStyles);

        // =========================================================
        // 📌 PENGATURAN LEBAR KOLOM
        // =========================================================
        foreach ([$sheet2, $sheet3] as $s) {
            $highestColumn = $s->getHighestColumn();
            foreach (range('A', $highestColumn) as $colLetter) {
                $s->getColumnDimension($colLetter)->setAutoSize(true);
            }
        }

        $sheet1->getColumnDimension('A')->setWidth(14);
        $sheet1->getColumnDimension('B')->setWidth(24);
        $sheet1->getColumnDimension('C')->setWidth(28);
        $sheet1->getColumnDimension('D')->setWidth(14);
        $sheet1->getColumnDimension('E')->setWidth(16);
        $sheet1->getColumnDimension('F')->setWidth(24);
        $sheet1->getColumnDimension('H')->setWidth(5);
        $sheet1->getColumnDimension('I')->setWidth(18);
        $sheet1->getColumnDimension('J')->setWidth(40);
        $sheet1->getColumnDimension('K')->setWidth(30);
        $sheet1->getStyle("H1:K{$lastPetunjukRow}")->getAlignment()->setWrapText(true);

        // Ekspor
        $writer = new Xlsx($spreadsheet);
        $filename = 'template_import_jadwal.xlsx';

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    // Tambahkan di ExportController
    // app/Http/Controllers/ExportController.php
    
    public function exportDataParamedic()
    {
        $spreadsheet = new Spreadsheet();

        // =========================================================
        // 📌 SHEET 1: DATA PARAMEDIC (template input)
        // =========================================================
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Data Paramedic');

        // Header
        $sheet1->setCellValue('A1', 'No.');
        $sheet1->setCellValue('B1', 'Nama Dokter');
        $sheet1->setCellValue('C1', 'posisiasi');

        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Arial', 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2F5597']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $sheet1->getStyle('A1:C1')->applyFromArray($headerStyle);
        $sheet1->getRowDimension('1')->setRowHeight(28);

        // Style border tipis + wrap text untuk seluruh area input (100 baris)
        $thinBorderWrap = [
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'D9D9D9'],
                ],
            ],
            'font'      => ['name' => 'Arial', 'size' => 10],
            'alignment' => [
                'vertical'   => Alignment::VERTICAL_CENTER,
                'wrapText'   => true,   // ✅ wrap text aktif
            ],
        ];

        $sheet1->getStyle('A2:C10000')->applyFromArray($thinBorderWrap);

        // Isi kolom No. secara otomatis
        for ($i = 2; $i <= 10000; $i++) {
            $sheet1->setCellValue("A{$i}", $i - 1);
        }

        // Lebar kolom
        $sheet1->getColumnDimension('A')->setWidth(6);
        $sheet1->getColumnDimension('B')->setWidth(35);
        $sheet1->getColumnDimension('C')->setWidth(35);

        // =========================================================
        // 📌 SHEET 2: MASTER DATA posisi
        // =========================================================
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Master posisi');
        $sheet2->setCellValue('A1', 'Nama posisi');

        $masterHeaderStyle = [
            'font'      => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Arial'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '595959']],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ];
        $sheet2->getStyle('A1')->applyFromArray($masterHeaderStyle);
        $sheet2->getRowDimension('1')->setRowHeight(25);

        $specialties = DB::table('posisi')
            ->where('is_deleted', 0)
            ->orderBy('nama_posisi', 'asc')
            ->pluck('nama_posisi');

        $rowIdx = 2;
        foreach ($specialties as $namaposisi) {
            $sheet2->setCellValue("A{$rowIdx}", $namaposisi);
            // Terapkan border & wrap text juga di sheet ini
            $sheet2->getStyle("A{$rowIdx}")->applyFromArray($thinBorderWrap);
            $rowIdx++;
        }
        $totalposisi = $rowIdx - 1;

        // ✅ wrap text juga di area data Master posisi
        $sheet2->getStyle("A2:A{$rowIdx}")->getAlignment()->setWrapText(true);
        $sheet2->getColumnDimension('A')->setAutoSize(true);

        // =========================================================
        // 📌 DATA VALIDATION: Dropdown posisi di Sheet1 kolom C
        //    - Tidak menampilkan error → bisa ketik manual
        // =========================================================
        $dvposisi = new DataValidation();
        $dvposisi->setType(DataValidation::TYPE_LIST);
        $dvposisi->setAllowBlank(true);
        $dvposisi->setShowDropDown(true);
        $dvposisi->setShowErrorMessage(false);   // ⬅️ biarkan manual tanpa peringatan
        $dvposisi->setFormula1("'Master posisi'!\$A\$2:\$A\${$totalposisi}");
        $sheet1->setDataValidation('C2:C10000', $dvposisi);

        // =========================================================
        // 📌 CONDITIONAL FORMATTING: Kolom posisiasi (C2:C10000)
        //    🟢 Hijau = ada di Master posisi
        //    🔴 Merah  = tidak ada (baru) → tetap bisa diisi manual
        // =========================================================
        $conditionalStyles = [];

        // 🟢 Valid
        $correctStyle = new Conditional();
        $correctStyle->setConditionType(Conditional::CONDITION_EXPRESSION);
        $correctStyle->addCondition(
            "=AND(C2<>\"\", COUNTIF('Master posisi'!\$A\$2:\$A\${$totalposisi}, C2) > 0)"
        );
        $correctStyle->getStyle()->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E2EFDA');  // hijau pastel
        $correctStyle->getStyle()->getFont()->getColor()->setRGB('375623');
        $conditionalStyles[] = $correctStyle;

        // 🔴 Tidak valid (merah)
        $wrongStyle = new Conditional();
        $wrongStyle->setConditionType(Conditional::CONDITION_EXPRESSION);
        $wrongStyle->addCondition(
            "=AND(C2<>\"\", COUNTIF('Master posisi'!\$A\$2:\$A\${$totalposisi}, C2) = 0)"
        );
        $wrongStyle->getStyle()->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB('FCE4D6');  // merah pastel
        $wrongStyle->getStyle()->getFont()->getColor()->setRGB('C65911');
        $wrongStyle->getStyle()->getFont()->setBold(true);
        $conditionalStyles[] = $wrongStyle;

        $sheet1->setConditionalStyles('C2:C10000', $conditionalStyles);

        // =========================================================
        // 📌 EKSPOR FILE
        // =========================================================
        $writer = new Xlsx($spreadsheet);
        $filename = 'template_import_paramedic.xlsx';

        return response()->streamDownload(function () use ($writer) {
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}