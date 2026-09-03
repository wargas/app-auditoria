import { open } from '@tauri-apps/plugin-dialog'

import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Field, FieldContent, FieldLabel } from "#components/ui/field";

import "./App.css";
import { useState } from 'react';
import { InputGroup, InputGroupButton, InputGroupInput } from '#components/ui/input-group';
import { readFileByLine } from '#lib/utils';
import { Progress } from '#components/ui/progress';

function App() {

  const [files, setFiles] = useState<Record<string, string[]>>({})
  const [cnpj, setCNPJ] = useState(``)
  const [progress, setProgress] = useState(0)
  const [countFiles, setCountFiles] = useState(0)
  const [countReadFiles, setCountReadFiles] = useState(0)

  async function processar() {

    // for await(let file of files[``])
    // const db = await Database.load(`sqlite:./${cnpj}.db`);

    // await db.execute(`CREATE TABLE IF NOT EXISTS notas (id TEXT)`)

    // const lista = await db.select(`SELECT * from notas`)

    // const dir = await path.appDataDir()

    // console.log({dir, lista})
  }

  async function processarSped() {


    const filesSpeed = await open({
      multiple: true,
      directory: false
    })

    if (!filesSpeed) return;

    setCountFiles(filesSpeed.length)

    setCountReadFiles(0)

    for await (const file of filesSpeed) {
      setProgress(0)

      await readFileByLine(file, async (line, size, bytesRead) => {

        if (line.startsWith(`|`)) {
          // console.log({ size, bytesRead }, (bytesRead / size).toLocaleString(`pt-BR`, { style: 'percent' }))
        }

        setProgress((bytesRead / size) * 100)

      })

      setCountReadFiles(c => c + 1)
      setProgress(100)

    }

  }


  async function selectFile(key: string) {
    const file = await open({
      multiple: true,
      directory: false
    })

    if (file) {
      setFiles({ ...files, [key]: file })
      console.log(file)
    }
  }

  return (
    <main className="h-screen p-4">
      <div className="flex flex-col gap-4">


        <Field>
          <FieldLabel>CNPJ</FieldLabel>
          <Input value={cnpj} onChange={i => setCNPJ(i.target.value)} />
        </Field>

        <Field>
          <FieldLabel>NFCE</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['nfce'] ?? ''} />
              <InputGroupButton onClick={() => selectFile(`nfce`)}>Selecione</InputGroupButton>
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>NFE Emitidas</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['nfe-emitidas'] ?? ''} />
              <InputGroupButton onClick={() => selectFile(`nfe-emitidas`)}>Selecione</InputGroupButton>
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>NFE Recebidas</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['nfe-recebidas'] ?? ''} />
              <InputGroupButton onClick={() => selectFile(`nfe-recebidas`)}>Selecione</InputGroupButton>
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>SPED</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['sped'] ?? ''} />
              <InputGroupButton onClick={() => processarSped()}>Selecione</InputGroupButton>
            </InputGroup>

            <div className="flex flex-col gap-2 items-center mt-4">

              <div>lendo {countReadFiles} de {countFiles}</div>

              <Progress value={(countReadFiles / countFiles) * 100} />

              <Progress value={progress} />
            </div>

          </FieldContent>
        </Field>





        <Button onClick={processar} variant={`default`}>Processar</Button>
      </div>
    </main>
  );
}

export default App;
