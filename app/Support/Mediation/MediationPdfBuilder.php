<?php

declare(strict_types=1);

namespace App\Support\Mediation;

use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Contracts\View\Factory as ViewFactory;

final class MediationPdfBuilder
{
    public function __construct(
        private readonly ViewFactory $view,
    ) {
    }

    /**
     * @param array<string, mixed> $workspace
     * @param array<string, mixed> $report
     */
    public function render(array $workspace, array $report): string
    {
        $html = $this->view->make('mediation.report-print', [
            'workspace' => $workspace,
            'report' => $report,
            'renderMode' => 'pdf',
        ])->render();

        $options = new Options([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => false,
            'defaultFont' => 'DejaVu Sans',
        ]);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }
}
