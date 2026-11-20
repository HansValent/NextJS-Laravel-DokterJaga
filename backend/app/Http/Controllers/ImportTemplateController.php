<?php
// app/Http/Controllers/ImportTemplateController.php
namespace App\Http\Controllers;

use App\Models\ImportTemplate;
use Illuminate\Http\Request;

class ImportTemplateController extends Controller
{
    public function index()
    {
        return response()->json(ImportTemplate::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string',
            'type'    => 'required|string',
            'mapping' => 'sometimes|array',
            'options' => 'sometimes|array',
        ]);
        $template = ImportTemplate::create($data);
        return response()->json($template, 201);
    }

    public function destroy($id)
    {
        ImportTemplate::destroy($id);
        return response()->json(['success' => true]);
    }
}