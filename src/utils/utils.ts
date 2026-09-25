import { exec } from 'child_process';
import util from 'util';
import { Response } from "express";
import { join } from 'path';
import { AppDataSource } from '../db/data-source';
import { HotelExtra } from '../entities/HotelExtra';

const execAsync = util.promisify(exec);

function formatDatetime(
  dateString: string,
  locale: string = 'en-US',
  timeZone: string = 'Asia/Riyadh'
): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date string provided.');
  }

  const options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
  };

  return date.toLocaleString(locale, options);
}

const handleError = (res: Response, error: any) => {
  console.error("Error:", error);
  return res
    .status(500)
    .json({ error: error.message || "Internal Server Error" });
};

const csv_path = (file_name: string) =>{
   const csvFilePath = join(
                  process.cwd(),
                  "public",
                  "csv",
                  file_name
              );

              console.log("csv file path ;;;", csvFilePath);
  return csvFilePath;
}

async function getAllowedAmenities(type: string | string[]): Promise<string[]> {
  const repo = AppDataSource.getRepository(HotelExtra);

  const types = Array.isArray(type) ? type : [type];

  const extras = await repo.find({
    where: types.map((t) => ({ type: t }))
  });

  return extras.map((e) =>
    e.name
      .toLowerCase()
      .replace(/\s+/g, "")      // remove spaces
      .replace(/-/g, "")        // remove hyphens
      .replace(/[^a-z0-9]/g, "") // remove other chars
  );
}


async function getAllowedHotelExtras(
  type: string | string[]
): Promise<{ value: string; label: string }[]> {
  const repo = AppDataSource.getRepository(HotelExtra);

  const types = Array.isArray(type) ? type : [type];

  const extras = await repo.find({
    where: types.map((t) => ({ type: t }))
  });

  return extras.map((e) => {
    const value = e.name
      .toLowerCase()
      .replace(/\s+/g, "_")      // remove spaces
      .replace(/-/g, "")        // remove hyphens
      .replace(/[^a-z0-9]/g, ""); // remove unwanted chars

    return {
      value,        // normalized machine key
      label: e.name // original readable name
    };
  });
}



export { formatDatetime, execAsync, handleError, csv_path, getAllowedAmenities, getAllowedHotelExtras };

