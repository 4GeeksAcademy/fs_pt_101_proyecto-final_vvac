

const Register = () => {
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card p-4 shadow">
                            <h3>Wellcome Chef!</h3>
                            <form>
                                <div className="mb-3">
                                    <label for="InputUserName" class="form-label">
                                        Username
                                    </label>
                                    <input
                                        type="UserName"
                                        class="form-control"
                                        id="InputUserName"
                                        aria-describedby="UserHelp"
                                    />
                                    <div id="UserHelp" class="form-text">
                                        Type here your Username.
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label for="exampleInputEmail1" class="form-label">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        class="form-control"
                                        id="exampleInputEmail1"
                                        aria-describedby="emailHelp"
                                    />
                                    <div id="emailHelp" class="form-text">
                                        We'll never share your email with anyone else.
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label for="exampleInputPassword1" class="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        class="form-control"
                                        id="exampleInputPassword1"
                                    />
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    Register
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register
