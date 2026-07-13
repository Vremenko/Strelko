import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="not-found-page page--standard">
      <header className="page-header">
        <h1>Stran ni najdena</h1>
        <p className="page-header__lead">
          Naslov, ki ste ga vnesli, na Strelku ne obstaja ali ni več na voljo.
        </p>
      </header>
      <p>
        <Link to="/" className="btn btn-primary">
          Nazaj na domačo stran
        </Link>
      </p>
    </section>
  );
}
