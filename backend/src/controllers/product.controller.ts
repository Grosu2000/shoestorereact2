import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, brand, minPrice, maxPrice, search } = req.query;
    
    const where: any = {};

    if (category) where.category = category as string;
    if (brand) where.brand = brand as string;
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { brand: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      price,
      description,
      category,
      brand,
      sizes,
      colors,
      material,
      country,
      images
    } = req.body;

    
    if (!name || !price || !category || !brand) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');

    
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        price: parseFloat(price),
        description,
        category,
        brand,
        sizes: sizes || [],
        colors: colors || [],
        material,
        country,
        images: images || ['/images/placeholder.jpg'],
        stock: sizes?.reduce((sum: number, size: any) => sum + (size.stock || 0), 0) || 0,
        inStock: sizes?.some((size: any) => size.stock > 0) || false
      }
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Product with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create product'
    });
  }
};



export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      const products = await prisma.product.findMany();
      return res.json({
        success: true,
        data: products
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q as string, mode: 'insensitive' } },
          { description: { contains: q as string, mode: 'insensitive' } },
          { brand: { contains: q as string, mode: 'insensitive' } },
          { category: { contains: q as string, mode: 'insensitive' } }
        ]
      }
    });

    res.json({
      success: true,
      data: products,
      total: products.length
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};


export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        
        ...(updateData.sizes && {
          stock: updateData.sizes.reduce((sum: number, size: any) => sum + (size.stock || 0), 0),
          inStock: updateData.sizes.some((size: any) => size.stock > 0)
        })
      }
    });

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update product'
    });
  }
};


export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    
    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete product'
    });
  }
};