import { NetCDFReader } from 'netcdfjs';
import { NetCDFData } from 'src/types/NetCDFData';
const loadNetCDF = (filePath: string) => {
  return new Promise(function (resolve: (value: NetCDFData) => void) {
    const request = new XMLHttpRequest();
    request.open('GET', filePath);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      const arrayToMap = function (array: any) {
        return array.reduce(function (map: any, object: any) {
          map[object.name] = object;
          return map;
        }, {});
      };
      const NetCDF = new NetCDFReader(request.response);
      const data: NetCDFData = {
        dimensions: {
          lon: 0,
          lat: 0,
          lev: 0,
        },
        lon: {
          array: new Float32Array(),
          min: 0,
          max: 0,
          delta: 0,
        },
        lat: {
          array: new Float32Array(),
          min: 0,
          max: 0,
          delta: 0,
        },
        lev: {
          array: new Float32Array(),
          min: 0,
          max: 0,
        },
        U: {
          array: new Float32Array(),
          min: 0,
          max: 0,
        },
        V: {
          array: new Float32Array(),
          min: 0,
          max: 0,
        },
      };
      const dimensions = arrayToMap(NetCDF.dimensions);
      // data.dimensions = {}
      data.dimensions.lon = dimensions['lon'].size;
      data.dimensions.lat = dimensions['lat'].size;
      data.dimensions.lev = dimensions['lev'].size;
      const variables = arrayToMap(NetCDF.variables);
      const uAttributes = arrayToMap(variables['U'].attributes);
      const vAttributes = arrayToMap(variables['V'].attributes);
      // data.lon = {}
      data.lon.array = new Float32Array(NetCDF.getDataVariable('lon').flat() as number[]);
      data.lon.min = Math.min(...data.lon.array);
      data.lon.max = Math.max(...data.lon.array);
      data.lon.delta = data.lon.array[1] - data.lon.array[0];
      // data.lat = {}
      data.lat.array = new Float32Array(NetCDF.getDataVariable('lat').flat() as number[]);
      data.lat.min = Math.min(...data.lat.array);
      data.lat.max = Math.max(...data.lat.array);
      data.lat.delta = data.lat.array[1] - data.lat.array[0];
      // data.lev = {}
      data.lev.array = new Float32Array(NetCDF.getDataVariable('lev').flat() as number[]);
      data.lev.min = Math.min(...data.lev.array);
      data.lev.max = Math.max(...data.lev.array);
      // data.U = {}
      data.U.array = new Float32Array(NetCDF.getDataVariable('U').flat() as number[]);
      data.U.min = uAttributes['min'].value;
      data.U.max = uAttributes['max'].value;
      // data.V = {}
      data.V.array = new Float32Array(NetCDF.getDataVariable('V').flat() as number[]);
      data.V.min = vAttributes['min'].value;
      data.V.max = vAttributes['max'].value;
      resolve(data);
    };
    request.send();
  });
};

const imageToUrl = (file: File) => {
  const objectURL = URL.createObjectURL(file);
  return objectURL;
};

const getMediaDimension = (media: HTMLImageElement | HTMLVideoElement) => {
  const width = media instanceof HTMLImageElement ? media.naturalWidth : media.videoWidth;
  const height = media instanceof HTMLImageElement ? media.naturalHeight : media.videoHeight;
  return { width, height };
};

const getSpatialInfo = (position: Cesium.PositionProperty | Cesium.Cartesian3) => {
  if (position instanceof Cesium.PositionProperty) {
    position = position.getValue(new Cesium.JulianDate()) as Cesium.Cartesian3;
  }
  const cartographic = Cesium.Cartographic.fromCartesian(position);
  const longitude = Cesium.Math.toDegrees(cartographic.longitude);
  const latitude = Cesium.Math.toDegrees(cartographic.latitude);
  const height = cartographic.height;

  return {
    longitude,
    latitude,
    height,
    cartesian_x: position.x,
    cartesian_y: position.y,
    cartesian_z: position.z,
  };
};

const getImageDimensions = (file: File | string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = file instanceof File ? URL.createObjectURL(file) : file;
  });
};

const createImgSrc = (base64String: string, type: string) => {
  // 构建 Data URL
  const dataURL = `data:${type};base64,${base64String}`;
  return dataURL;
};

export { loadNetCDF, imageToUrl, getMediaDimension, getSpatialInfo, getImageDimensions, createImgSrc };
