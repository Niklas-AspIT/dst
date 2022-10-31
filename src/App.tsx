import { useState } from "react";
import { Formik, FormikValues, Form, ErrorMessage, Field } from "formik";
import fetchDST from "./lib/fetchDST";
import Style from "./styles/Home.module.scss";

// Get the value from the DST API Object
const getDSTValue = (data: { [key: string]: any }): number => {
  return data.dataset.value.reduce((a: number, b: number) => a + b);
};

// Link to API -> https://www.dst.dk/da/Statistik/brug-statistikken/muligheder-i-statistikbanken/api

const App = () => {
  const [result, setResult] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className={Style.wrapper}>
      <main className={Style.wrapper__main}>
        {/* Formik forms, read here: https://formik.org/docs/overview */}
        <Formik
          initialValues={{
            type: "car",
            year: new Date().getFullYear(),
            month: new Date().getMonth(),
          }}
          validate={(values) => {
            const errors: FormikValues = {};
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentMonth = date.getMonth();

            if (
              values.year === currentYear - 10 &&
              values.month <= currentMonth
            ) {
              errors.year = `Årstal og måned går over 10 år tilbage`;
            }

            if (values.year > currentYear || values.year < currentYear - 10) {
              errors.year = `Vælg et år mellem ${
                currentYear - 10
              }-${currentYear}`;
            }

            if (values.month > 12 || values.month < 1) {
              errors.month = "Vælg en måned mellem 1-12";
            }

            if (values.year === currentYear && values.month > currentMonth) {
              errors.month = "Vælg en måned som ikke er i fremtiden";
            }

            if (
              values.year === currentYear &&
              values.month === currentMonth + 1
            ) {
              errors.month = "Vælg en måned som ikke er den nuværende måned ";
            }

            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            setLoading(true);

            const { type, year, month } = values;

            // Format the month
            // Examples: 10 -> M10, 1 -> M01
            let formatMonth = "M" + month.toString();
            if (month < 10) {
              formatMonth = "M0" + month;
            }

            try {
              const data = await fetchDST(type, year.toString(), formatMonth);
              const value = getDSTValue(data);

              setResult(value);
            } catch {
              setResult("Der opstod en fejl, prøv igen");
            }

            // Set the result states
            setLoading(false);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, resetForm }) => (
            <Form className={Style.main__form}>
              <div className={Style.form__row}>
                <label htmlFor="type" className={Style.form__label}>
                  Køretøj
                  <Field name="type" as="select">
                    <option value="car">Personbiler</option>
                    <option value="bus">Busser</option>
                    <option value="truck">Vare og lastvogne </option>
                    <option value="motorcycle">
                      Motorcykler og knallerter
                    </option>
                  </Field>
                </label>
                <label htmlFor="year" className={Style.form__label}>
                  Årstal
                  <Field
                    required
                    type="number"
                    name="year"
                    min={new Date().getFullYear() - 10}
                    max={new Date().getFullYear()}
                  />
                </label>
                <label htmlFor="month" className={Style.form__label}>
                  Måned
                  <Field required type="number" name="month" min={1} max={12} />
                </label>
                {result ? (
                  <div
                    className={Style.form__button}
                    onClick={() => {
                      resetForm();
                      setResult(null);
                    }}
                  >
                    Nulstil
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={Style.form__button}
                  >
                    Søg
                  </button>
                )}
              </div>
              <div className={Style.form__row}>
                <ErrorMessage
                  name="year"
                  component="div"
                  className={Style.form__error}
                />

                <ErrorMessage
                  name="month"
                  component="div"
                  className={Style.form__error}
                />
              </div>
            </Form>
          )}
        </Formik>
        <div className={Style.main__result}>
          {loading && <div className={Style.result__spinner}></div>}
          {result && (
            <>
              <small className={Style.result__title}>RESULTAT</small>
              <strong className={Style.result__value} data-testid="result">
                {result}
              </strong>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
