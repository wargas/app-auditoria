import { open } from '@tauri-apps/plugin-dialog'

import { Button } from "#components/ui/button";
import { Input } from "#components/ui/input";
import { Field, FieldContent, FieldLabel } from "#components/ui/field";

import "./App.css";
import { useState } from 'react';
import { InputGroup, InputGroupButton, InputGroupInput } from '#components/ui/input-group';

function App() {

  const [files, setFiles] = useState<Record<string, string>>()


  async function selectFile(key: string) {
    const file = await open({
      multiple: false,
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
          <Input />
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
              <InputGroupInput value={files?.['nfe-emitidas'] ?? ''}  />
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
          <FieldLabel>SPED Entradas</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['sped-entradas'] ?? ''} />
              <InputGroupButton onClick={() => selectFile(`sped-entradas`)}>Selecione</InputGroupButton>
            </InputGroup>
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>SPED Saidas</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput value={files?.['sped-saidas'] ?? ''} />
              <InputGroupButton onClick={() => selectFile(`sped-saidas`)}>Selecione</InputGroupButton>
            </InputGroup>
          </FieldContent>
        </Field>


                

        <Button variant={`default`}>Processar</Button>
      </div>
    </main>
  );
}

export default App;
