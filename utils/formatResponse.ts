type Object = {
  [key:string]: any;
};

export default function (body: Object) {
  const modelData = structuredClone(body.schema);
  const id = modelData.id;

  delete modelData.id;

  return { id, data: modelData };
}
