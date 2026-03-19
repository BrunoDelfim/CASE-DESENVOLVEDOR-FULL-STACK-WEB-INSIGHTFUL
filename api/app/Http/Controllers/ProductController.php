<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $categoryId = $request->filled('category_id')
            ? (int) $request->category_id
            : null;

        $search = $request->filled('search')
            ? trim($request->search)
            : null;

        $perPage = $request->filled('per_page')
            ? (int) $request->per_page
            : 5;

        $products = $this->productService->list($categoryId, $search, $perPage);

        return response()->json([
            'data' => ProductResource::collection($products->items()),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage(),
            'per_page' => $products->perPage(),
            'total' => $products->total(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:categories,id'],
            'image_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $product = $this->productService->create($data);

        return response()->json(
            new ProductResource($product->load('category')),
            201
        );
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json(
            new ProductResource($product->load('category'))
        );
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'category_id' => ['required', 'exists:categories,id'],
            'image_url' => ['nullable', 'url', 'max:2048'],
        ]);

        $updatedProduct = $this->productService->update($product, $data);

        return response()->json(
            new ProductResource($updatedProduct->load('category'))
        );
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->productService->delete($product);

        return response()->json([
            'message' => 'Produto removido com sucesso.'
        ]);
    }
}
