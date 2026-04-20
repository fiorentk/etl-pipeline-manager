import { Request, Response } from 'express';
import prisma from '../prisma';

const getModel = (type: string) => {
  switch (type) {
    case 'datasources': return prisma.datasource;
    case 'dataflows': return prisma.dataflow;
    case 'destinations': return prisma.destination;
    case 'etls': return prisma.etl;
    default: return null;
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const model = getModel(type as string);
    
    if (!model) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    let include = {};
    if (type === 'etls') {
      include = {
        datasource: true,
        dataflow: true,
        destination: true,
      };
    }

    // @ts-ignore
    const data = await model.findMany({
      where: { isactive: true },
      include: Object.keys(include).length > 0 ? include : undefined
    });
    
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOne = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const model = getModel(type as string);
    
    if (!model) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    let include = {};
    if (type === 'etls') {
      include = {
        datasource: true,
        dataflow: true,
        destination: true,
      };
    }

    // @ts-ignore
    const data = await model.findUnique({
      where: { id: parseInt(id as string) },
      include: Object.keys(include).length > 0 ? include : undefined
    });

    if (!data) {
      res.status(404).json({ error: 'Entity not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const model = getModel(type as string);
    
    if (!model) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    // @ts-ignore
    const data = await model.create({
      data: req.body
    });

    res.status(201).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const model = getModel(type as string);
    
    if (!model) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    // @ts-ignore
    const data = await model.update({
      where: { id: parseInt(id as string) },
      data: req.body
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const model = getModel(type as string);
    
    if (!model) {
      res.status(400).json({ error: 'Invalid entity type' });
      return;
    }

    // We do soft delete as per schema having isactive boolean
    // @ts-ignore
    await model.update({
      where: { id: parseInt(id as string) },
      data: { isactive: false }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
