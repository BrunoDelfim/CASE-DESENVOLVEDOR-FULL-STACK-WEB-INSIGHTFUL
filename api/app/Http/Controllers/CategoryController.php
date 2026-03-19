<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->filled('per_page')
            ? (int) $request->per_page
            : 5;

        $categories = $this->categoryService->list($perPage);

        return response()->json([
            'data' => CategoryResource::collection($categories->items()),
            'current_page' => $categories->currentPage(),
            'last_page' => $categories->lastPage(),
            'per_page' => $categories->perPage(),
            'total' => $categories->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $category = $this->categoryService->create($data);

        return response()->json(
            new CategoryResource($category),
            201
        );
    }

    public function show(Category $category): JsonResponse
    {
        return response()->json(
            new CategoryResource($category)
        );
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $updatedCategory = $this->categoryService->update($category, $data);

        return response()->json(
            new CategoryResource($updatedCategory)
        );
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->categoryService->delete($category);

        return response()->json([
            'message' => 'Categoria removida com sucesso.'
        ]);
    }
}
